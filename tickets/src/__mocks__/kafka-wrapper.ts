export const mockProducer = {
  connect: jest.fn(),
  send: jest.fn(),
  disconnect: jest.fn(),
  publish: jest.fn().mockImplementation(() => {
    (subject: string, data: string, callback: () => void) => {
      callback();
    }
  }),
};

export const kafkaWrapper = {
  connect: jest.fn(),
  client: {
    producer: jest.fn(() => mockProducer),
  },
};