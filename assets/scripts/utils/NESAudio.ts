export default class {
    private audioContext: AudioContext | null = null;
    private processor: ScriptProcessorNode | null = null;
    private gainNode: GainNode | null = null;

    private leftBuffer: Float32Array = new Float32Array(44100);
    private rightBuffer: Float32Array = new Float32Array(44100);

    private writeIndex = 0;
    private readIndex = 0;
    private readonly BUFFER_SIZE = 44100;

    public start(): void {
        if (this.audioContext) {
            return;
        }
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();

        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0.5;

        this.processor = this.audioContext.createScriptProcessor(1024, 0, 2);
        this.processor.onaudioprocess = (event: AudioProcessingEvent) => {
            const outputL = event.outputBuffer.getChannelData(0);
            const outputR = event.outputBuffer.getChannelData(1);

            for (let i = 0; i < outputL.length; i++) {
                if (this.readIndex !== this.writeIndex) {
                    outputL[i] = this.leftBuffer[this.readIndex];
                    outputR[i] = this.rightBuffer[this.readIndex];
                    this.readIndex++;
                    if (this.readIndex >= this.BUFFER_SIZE) {
                        this.readIndex = 0;
                    }
                } else {
                    outputL[i] = 0;
                    outputR[i] = 0;
                }
            }
        };

        this.processor.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
    }

    public push(left: number, right: number): void {
        const nextIndex = (this.writeIndex + 1) % this.BUFFER_SIZE;
        // Buffer 满了就丢最旧的数据
        if (nextIndex === this.readIndex) {
            this.readIndex = (this.readIndex + 1) % this.BUFFER_SIZE;
        }
        this.leftBuffer[this.writeIndex] = left;
        this.rightBuffer[this.writeIndex] = right;
        this.writeIndex = nextIndex;
    }

    public resume(): void {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    public destroy(): void {
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
