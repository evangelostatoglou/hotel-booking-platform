export class AppError extends Error {
  constructor( public readonly statusCode: number, public readonly code: string, message: string){
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidRoomTypeError extends AppError {
  constructor() {
    super(400, "INVALID_ROOM_TYPE", "The selected room type is invalid.");
  }
}

export class InsufficientAvailabilityError extends AppError {
  constructor() {
    super(409, "INSUFFICIENT_AVAILABILITY", "Not enough rooms are available for this request.");
  }
}

export class CapacityExceededError extends AppError {
  constructor() {
    super(422, "CAPACITY_EXCEEDED", "Too many adults or children for the chosen rooms.");
  }
}
