import { BaseProducer } from "../../../common/src/events/base-producer";
import { TicketCreatedEvent } from "../../../common/src/events/ticket-created-event";
import { Subjects } from "../../../common/src/events/subjects";

export class TicketCreatedProducer extends BaseProducer<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'ticketing-group'
}