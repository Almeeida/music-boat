export interface Song {
  // title: string;
  url: string;
  // thumbnail: string;
  requester: string;
};

export interface Queue {
  songs: Song[];
};
