export interface VideoContent {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    genre: string[];
    isOriginal: boolean;
    releaseDate: Date;
    rating: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    photoUrl: string;
}
