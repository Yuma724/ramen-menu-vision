export interface Dish {
  id: string;
  nameJP: string;
  nameEN: string;
  descriptionJP?: string;
  descriptionEN?: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface SharedMenu {
  id: string;
  slug: string;
  dishes: Dish[];
  createdAt: string;
}

