import { BaseProducer, Subjects, TicketUpdatedEvent } from "@emerson-sgittix/common";

export class TicketUpdatedPublisher extends BaseProducer<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = 'ticketing-group'
}