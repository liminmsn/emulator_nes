export default interface Audio {
    start(): void;
    push(left: number, right: number): void;
    resume(): void;
    destroy(): void;
}