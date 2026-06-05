export interface IConfigRepository {
  getValue(key: string): Promise<string | null>;

  setValue(
    key: string,
    value: string
  ): Promise<void>;
}