import { User } from './user';

export interface News {
    author: User;
    country: string;
    content: string;
    date: Date;
}