import mongoose from 'mongoose';
import { app } from './app';
import { kafkaWrapper } from './kafka-wrapper';
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  if (!process.env.KAFKA_URL) {
    throw new Error('KAFKA_URL must be defined');
  }
  if (!process.env.KAFKA_GROUP) {
    throw new Error('KAFKA_GROUP must be defined');
  }
  
  try {
    await kafkaWrapper.connect(process.env.KAFKA_GROUP, [process.env.KAFKA_URL]);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }
}

app.listen(3000, () => {
  console.log('Listening on port 3000!!');
});

start();