export interface IBaseService<T> {
  getById(id: string): Promise<T | null>;

  create(data: Partial<T>): Promise<T>;

  update(
    id: string,
    data: Partial<T>
  ): Promise<T>;

  delete(id: string): Promise<void>;
}