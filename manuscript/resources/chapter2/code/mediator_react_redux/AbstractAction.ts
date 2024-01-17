export default abstract class AbstractAction<S> {
  abstract perform(state: S): S;
}