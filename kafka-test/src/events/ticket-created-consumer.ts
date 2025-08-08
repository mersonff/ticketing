import { BaseConsumer } from '../../../common/src/events/base-consumer';
import { TicketCreatedEvent } from '../../../common/src/events/ticket-created-event';
import { Subjects } from '../../../common/src/events/subjects';

export class TicketCreatedConsumer extends BaseConsumer<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
  queueGroupName = 'ticketing-group'

  async onMessage(payload: TicketCreatedEvent['data'],): Promise<void> {
    console.log(`Mensagem recebida: ${payload?.title} - ${payload?.price}`);
  }
}