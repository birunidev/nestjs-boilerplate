export class CustomResponseDto {
  constructor(
    public statusCode: number,
    public message: string,
    public data: any,
  ) {}
}
