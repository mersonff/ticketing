import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@emerson-sgittix/common';
import { requireAuth } from '@emerson-sgittix/common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { Kafka } from 'kafkajs';
import { kafkaWrapper } from '../kafka-wrapper';

const router = express.Router();

router.post('/api/tickets',
  requireAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id
    })

    ticket.save();

    const producer = new TicketCreatedPublisher(kafkaWrapper.client);
    await producer.connect();

    await producer.publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });
    
    res.status(201).send(ticket);
});

export { router as createTicketRouter };