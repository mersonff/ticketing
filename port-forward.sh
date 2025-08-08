#!/bin/bash

# Port Forwarding Script for Microservices
# This script provides port forwarding for all services in the ticketing application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service configurations
declare -A SERVICES=(
    ["tickets"]="3000:3000"
    ["auth"]="3001:3000"
    ["client"]="3002:3000"
    ["kafka"]="9092:9092"
    ["zookeeper"]="2181:2181"
    ["nats"]="4222:4222"
    ["tickets-mongo"]="27017:27017"
    ["auth-mongo"]="27018:27017"
)

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Port Forwarding Script${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
}

# Function to check if namespace exists
check_namespace() {
    local namespace=${1:-default}
    if ! kubectl get namespace "$namespace" &> /dev/null; then
        print_error "Namespace '$namespace' does not exist"
        exit 1
    fi
}

# Function to get pod name for a service
get_pod_name() {
    local service=$1
    local namespace=${2:-default}
    
    # Try to get the pod name
    local pod_name=$(kubectl get pods -n "$namespace" -l app="$service" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$pod_name" ]; then
        # Try alternative label selectors
        pod_name=$(kubectl get pods -n "$namespace" -l "app.kubernetes.io/name=$service" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    fi
    
    if [ -z "$pod_name" ]; then
        # Try by name pattern
        pod_name=$(kubectl get pods -n "$namespace" | grep "$service" | head -1 | awk '{print $1}')
    fi
    
    echo "$pod_name"
}

# Function to check if pod is ready
wait_for_pod() {
    local service=$1
    local namespace=${2:-default}
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service pod to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        local pod_name=$(get_pod_name "$service" "$namespace")
        
        if [ -n "$pod_name" ]; then
            local status=$(kubectl get pod "$pod_name" -n "$namespace" -o jsonpath='{.status.phase}' 2>/dev/null)
            
            if [ "$status" = "Running" ]; then
                local ready=$(kubectl get pod "$pod_name" -n "$namespace" -o jsonpath='{.status.containerStatuses[0].ready}' 2>/dev/null)
                
                if [ "$ready" = "true" ]; then
                    print_status "$service pod is ready: $pod_name"
                    return 0
                fi
            fi
        fi
        
        print_warning "Attempt $attempt/$max_attempts: $service pod not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    print_error "$service pod failed to become ready after $max_attempts attempts"
    return 1
}

# Function to start port forwarding for a service
port_forward_service() {
    local service=$1
    local port_mapping=$2
    local namespace=${3:-default}
    
    local pod_name=$(get_pod_name "$service" "$namespace")
    
    if [ -z "$pod_name" ]; then
        print_error "Could not find pod for service: $service"
        return 1
    fi
    
    print_status "Starting port forward for $service ($pod_name) on $port_mapping"
    
    # Start port forwarding in background
    kubectl port-forward -n "$namespace" "$pod_name" "$port_mapping" &
    local pid=$!
    
    # Store PID for cleanup
    echo "$pid" >> /tmp/port_forward_pids.txt
    
    print_status "Port forward started for $service (PID: $pid)"
    return 0
}

# Function to stop all port forwards
stop_port_forwards() {
    print_status "Stopping all port forwards..."
    
    if [ -f /tmp/port_forward_pids.txt ]; then
        while read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                print_status "Stopping process $pid"
                kill "$pid"
            fi
        done < /tmp/port_forward_pids.txt
        
        rm -f /tmp/port_forward_pids.txt
    fi
    
    print_status "All port forwards stopped"
}

# Function to show current port forwards
show_port_forwards() {
    print_status "Current port forwards:"
    
    if [ -f /tmp/port_forward_pids.txt ]; then
        while read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                print_status "Active process: $pid"
            fi
        done < /tmp/port_forward_pids.txt
    else
        print_warning "No active port forwards found"
    fi
}

# Function to start all services
start_all_services() {
    local namespace=${1:-default}
    
    print_status "Starting port forwarding for all services..."
    
    # Create PID file
    > /tmp/port_forward_pids.txt
    
    for service in "${!SERVICES[@]}"; do
        local port_mapping="${SERVICES[$service]}"
        
        # Wait for pod to be ready
        if wait_for_pod "$service" "$namespace"; then
            # Start port forwarding
            if port_forward_service "$service" "$port_mapping" "$namespace"; then
                sleep 1
            else
                print_warning "Failed to start port forward for $service"
            fi
        else
            print_warning "Skipping $service - pod not ready"
        fi
    done
    
    print_status "Port forwarding setup complete!"
    print_status "Services available at:"
    for service in "${!SERVICES[@]}"; do
        local port_mapping="${SERVICES[$service]}"
        local local_port=$(echo "$port_mapping" | cut -d: -f1)
        echo -e "  ${BLUE}$service${NC}: localhost:$local_port"
    done
}

# Function to start specific service
start_specific_service() {
    local service=$1
    local namespace=${2:-default}
    
    if [ -z "${SERVICES[$service]}" ]; then
        print_error "Unknown service: $service"
        print_status "Available services: ${!SERVICES[*]}"
        exit 1
    fi
    
    local port_mapping="${SERVICES[$service]}"
    
    if wait_for_pod "$service" "$namespace"; then
        port_forward_service "$service" "$port_mapping" "$namespace"
    else
        print_error "Failed to start port forward for $service"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [SERVICE]     Start port forwarding for all services or specific service"
    echo "  stop               Stop all port forwards"
    echo "  status             Show current port forwards"
    echo "  help               Show this help message"
    echo ""
    echo "Options:"
    echo "  -n, --namespace    Kubernetes namespace (default: default)"
    echo ""
    echo "Available services:"
    for service in "${!SERVICES[@]}"; do
        local port_mapping="${SERVICES[$service]}"
        echo "  $service -> $port_mapping"
    done
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start all services"
    echo "  $0 start tickets            # Start only tickets service"
    echo "  $0 start -n my-namespace    # Start all services in my-namespace"
    echo "  $0 stop                     # Stop all port forwards"
}

# Main script logic
main() {
    print_header
    
    # Check prerequisites
    check_kubectl
    
    # Parse command line arguments
    local command=""
    local service=""
    local namespace="default"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            start)
                command="start"
                if [[ $# -gt 1 && ! $2 =~ ^- ]]; then
                    service="$2"
                    shift
                fi
                shift
                ;;
            stop)
                command="stop"
                shift
                ;;
            status)
                command="status"
                shift
                ;;
            help|--help|-h)
                show_help
                exit 0
                ;;
            -n|--namespace)
                namespace="$2"
                shift 2
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check namespace
    check_namespace "$namespace"
    
    # Execute command
    case $command in
        start)
            if [ -n "$service" ]; then
                start_specific_service "$service" "$namespace"
            else
                start_all_services "$namespace"
            fi
            ;;
        stop)
            stop_port_forwards
            ;;
        status)
            show_port_forwards
            ;;
        "")
            print_error "No command specified"
            show_help
            exit 1
            ;;
    esac
}

# Trap to cleanup on script exit (only for start command)
if [ "$command" = "start" ]; then
    trap 'stop_port_forwards' INT TERM
fi

# Run main function
main "$@"

# Keep script running to maintain port forwards
if [ "$command" = "start" ]; then
    print_status "Port forwards are active. Press Ctrl+C to stop all port forwards."
    print_status "Services available at:"
    for service in "${!SERVICES[@]}"; do
        local port_mapping="${SERVICES[$service]}"
        local local_port=$(echo "$port_mapping" | cut -d: -f1)
        echo -e "  ${BLUE}$service${NC}: localhost:$local_port"
    done
    
    # Wait for user to stop
    wait
fi
