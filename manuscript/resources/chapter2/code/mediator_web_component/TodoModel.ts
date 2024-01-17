export interface TodoModel {
  fetchTodos(): void;
  toggleTodoDone(id: number): void;
}