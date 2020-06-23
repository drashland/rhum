export class Stub {
  public returns(returnValue: any) {
    return function() {
      return returnValue;
    };
  }
}
