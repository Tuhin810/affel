import { IBaseRepository } from "../../core/contracts/IBaseRepository";

export abstract class BaseRepository<T>
  implements IBaseRepository<T>
{
  abstract findById(
    id: string
  ): Promise<T | null>;

  abstract create(
    data: Partial<T>
  ): Promise<T>;

  abstract update(
    id: string,
    data: Partial<T>
  ): Promise<T>;

  abstract delete(
    id: string
  ): Promise<void>;
}