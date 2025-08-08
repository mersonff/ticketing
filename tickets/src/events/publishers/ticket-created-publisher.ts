import { BaseProducer, Subjects, TicketCreatedEvent } from "@emerson-sgittix/common";

export class TicketCreatedPublisher extends BaseProducer<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'ticketing-group'
}