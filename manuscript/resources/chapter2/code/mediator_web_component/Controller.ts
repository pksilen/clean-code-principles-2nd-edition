export default class Controller<TModel, TView> {
  private model: TModel | undefined;
  private view: TView | undefined;

  getModel(): TModel | undefined {
    return this.model;
  }

  setModel(model: TModel): void {
    this.model = model;
  }

  getView(): TView | undefined {
    return this.view;
  }

  setView(view: TView): void {
    this.view = view;
  }
}