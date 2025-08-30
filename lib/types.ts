export type Poll = {
  id: string;
  question: string;
  created_at: string;
};

export type Option = {
  id: string;
  label: string;
  idx: number;
  poll_id: string;
};
