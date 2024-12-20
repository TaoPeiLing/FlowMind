import mongoose from 'mongoose';

export interface ITask extends mongoose.Document {
  title: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  status: 'todo' | 'doing' | 'done';
  priority: 'high' | 'medium' | 'low';
  emotionalState: string;
  deadline?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'doing', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  emotionalState: {
    type: String,
    default: 'neutral'
  },
  deadline: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

export const Task = mongoose.model<ITask>('Task', taskSchema); 