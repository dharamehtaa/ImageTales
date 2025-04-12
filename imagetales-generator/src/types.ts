export interface User {
    _id: string;
    email: string;
    username: string;
    credits: number;
    plan: string;
  }
  
  export interface Image {
    id: string;
    title: string;
    category: string;
    url: string;
    likes: number;
    created_at: string;
  }