interface TodoView {
  showTodos(todos: Todo[]): void;
  showError(errorMessage: string): void;
}