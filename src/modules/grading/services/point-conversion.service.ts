import { Injectable } from '@nestjs/common';

@Injectable()
export class PointConversionService {
  public readonly TOEIC_POINT_CONVERSION = {
    reading: new Map<number, number>(),
    listening: new Map<number, number>(),
  };

  constructor() {
    this.initToeicPointConversion();
  }

  initToeicPointConversion() {
    // listening point
    for (let i = 0; i < 496; i++) {
      if (i == 0) {
        this.TOEIC_POINT_CONVERSION.listening.set(i, 0);
      } else if (i <= 6) {
        this.TOEIC_POINT_CONVERSION.listening.set(i, 5);
      } else if (
        i <= 43 ||
        (i >= 46 && i <= 53) ||
        (i >= 55 && i <= 69) ||
        (i >= 71 && i <= 74) ||
        (i >= 76 && i <= 79) ||
        (i >= 81 && i <= 84) ||
        (i >= 86 && i <= 87) ||
        (i >= 89 && i <= 92)
      ) {
        this.TOEIC_POINT_CONVERSION.listening.set(
          i,
          this.TOEIC_POINT_CONVERSION.listening.get(i - 1) + 5,
        );
      } else if (i >= 93) {
        this.TOEIC_POINT_CONVERSION.listening.set(i, 495);
      } else {
        this.TOEIC_POINT_CONVERSION.listening.set(
          i,
          this.TOEIC_POINT_CONVERSION.listening.get(i - 1) + 10,
        );
      }
    }

    // reading point
    for (let i = 0; i < 496; i++) {
      if (i == 0) {
        this.TOEIC_POINT_CONVERSION.reading.set(i, 0);
      } else if (i <= 9) {
        this.TOEIC_POINT_CONVERSION.reading.set(i, 5);
      } else if (
        i <= 24 ||
        (i >= 26 && i <= 27) ||
        (i >= 29 && i <= 38) ||
        (i >= 40 && i <= 46) ||
        (i >= 48 && i <= 51) ||
        (i >= 53 && i <= 54) ||
        (i >= 56 && i <= 63) ||
        (i >= 65 && i <= 80) ||
        (i >= 83 && i <= 88) ||
        (i >= 90 && i <= 91) ||
        i == 93 ||
        (i >= 95 && i <= 96)
      ) {
        this.TOEIC_POINT_CONVERSION.reading.set(
          i,
          this.TOEIC_POINT_CONVERSION.reading.get(i - 1) + 5,
        );
      } else if (i == 81 || i == 82) {
        this.TOEIC_POINT_CONVERSION.reading.set(i, 405);
      } else if (i >= 97) {
        this.TOEIC_POINT_CONVERSION.reading.set(i, 495);
      } else {
        this.TOEIC_POINT_CONVERSION.reading.set(
          i,
          this.TOEIC_POINT_CONVERSION.reading.get(i - 1) + 10,
        );
      }
    }
  }
}
