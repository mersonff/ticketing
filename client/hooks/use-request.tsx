import axios, { AxiosResponse, Method } from 'axios';
import { useState } from 'react';
import { Alert } from 'antd';

interface UseRequestProps {
  url: string;
  method: Method;
  body?: any;
  onSuccess?: (data: any) => void;
}

interface ErrorResponse {
  response?: {
    data?: {
      errors?: Array<{ message: string; field?: string }>;
    };
  };
}

const useRequest = ({ url, method, body, onSuccess }: UseRequestProps) => {
  const [errors, setErrors] = useState<JSX.Element | null>(null);

  const doRequest = async (): Promise<any> => {
    try {
      setErrors(null);
      let response: AxiosResponse;
      
      switch (method) {
        case 'get':
          response = await axios.get(url);
          break;
        case 'post':
          response = await axios.post(url, body);
          break;
        case 'put':
          response = await axios.put(url, body);
          break;
        case 'delete':
          response = await axios.delete(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (error: unknown) {
      const errorResponse = error as ErrorResponse;
      const errorMessages = errorResponse.response?.data?.errors?.map(err => err.message) || ['Something went wrong'];
      
      setErrors(
        <Alert
          message="Oops!"
          description={
            <ul className="list-disc list-inside">
              {errorMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          }
          type="error"
          showIcon
          className="mb-4"
        />
      );
    }
  };

  return { doRequest, errors };
};

export default useRequest;
