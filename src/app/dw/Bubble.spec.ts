import { describe, expect, it } from 'vitest';
import { Bubble, BreakApartDelay, ColoredTextSpan } from '@/app/dw/Bubble';

describe('Bubble', () => {

    describe('removeSpecialEscapes()', () => {

        describe('delay escapes', () => {

            it('returns text unchanged when there are no escapes', () => {
                const delays: BreakApartDelay[] = [];
                const result = Bubble.removeSpecialEscapes('Hello world', delays);
                expect(result).toEqual('Hello world');
                expect(delays).toEqual([]);
            });

            it('removes a default delay escape and records its offset', () => {
                const delays: BreakApartDelay[] = [];
                const result = Bubble.removeSpecialEscapes('Hello\\d world', delays);
                expect(result).toEqual('Hello world');
                expect(delays).toEqual([ { offs: 5, millis: 500 } ]);
            });

            it('removes a timed delay escape and records its offset and duration', () => {
                const delays: BreakApartDelay[] = [];
                const result = Bubble.removeSpecialEscapes('Hi\\d{750}!', delays);
                expect(result).toEqual('Hi!');
                expect(delays).toEqual([ { offs: 2, millis: 750 } ]);
            });

            it('handles multiple delay escapes', () => {
                const delays: BreakApartDelay[] = [];
                const result = Bubble.removeSpecialEscapes('A\\dB\\d{200}C', delays);
                expect(result).toEqual('ABC');
                expect(delays).toHaveLength(2);
                expect(delays[0]).toEqual({ offs: 1, millis: 500 });
                expect(delays[1]).toEqual({ offs: 2, millis: 200 });
            });
        });

        describe('color escapes', () => {

            it('strips color escapes from text even when colorSpans is omitted', () => {
                const delays: BreakApartDelay[] = [];
                const result = Bubble.removeSpecialEscapes('\\c{red}Hi\\c', delays);
                expect(result).toEqual('Hi');
                expect(delays).toEqual([]);
            });

            it('removes a color escape and records the span', () => {
                const delays: BreakApartDelay[] = [];
                const colorSpans: ColoredTextSpan[] = [];
                const result = Bubble.removeSpecialEscapes('Hello \\c{red}world\\c!', delays, colorSpans);
                expect(result).toEqual('Hello world!');
                expect(colorSpans).toEqual([ { colorId: 'red', offs: 6, count: 5 } ]);
            });

            it('records start at 0 when the span is at the beginning', () => {
                const delays: BreakApartDelay[] = [];
                const colorSpans: ColoredTextSpan[] = [];
                const result = Bubble.removeSpecialEscapes('\\c{blue}Hi\\c there', delays, colorSpans);
                expect(result).toEqual('Hi there');
                expect(colorSpans).toEqual([ { colorId: 'blue', offs: 0, count: 2 } ]);
            });

            it('records the span covering text to the end of the string', () => {
                const delays: BreakApartDelay[] = [];
                const colorSpans: ColoredTextSpan[] = [];
                const result = Bubble.removeSpecialEscapes('Go \\c{green}now\\c', delays, colorSpans);
                expect(result).toEqual('Go now');
                expect(colorSpans).toEqual([ { colorId: 'green', offs: 3, count: 3 } ]);
            });

            it('handles multiple color spans', () => {
                const delays: BreakApartDelay[] = [];
                const colorSpans: ColoredTextSpan[] = [];
                const result = Bubble.removeSpecialEscapes(
                    '\\c{red}A\\c and \\c{blue}B\\c',
                    delays,
                    colorSpans,
                );
                expect(result).toEqual('A and B');
                expect(colorSpans).toHaveLength(2);
                expect(colorSpans[0]).toEqual({ colorId: 'red', offs: 0, count: 1 });
                expect(colorSpans[1]).toEqual({ colorId: 'blue', offs: 6, count: 1 });
            });

            it('handles a color id with hyphens and underscores', () => {
                const delays: BreakApartDelay[] = [];
                const colorSpans: ColoredTextSpan[] = [];
                const result = Bubble.removeSpecialEscapes(
                    '\\c{hero-name_color}Hi\\c',
                    delays,
                    colorSpans,
                );
                expect(result).toEqual('Hi');
                expect(colorSpans).toEqual([ { colorId: 'hero-name_color', offs: 0, count: 2 } ]);
            });

            it('produces an empty span when there is no text between opening and closing escapes', () => {
                const delays: BreakApartDelay[] = [];
                const colorSpans: ColoredTextSpan[] = [];
                const result = Bubble.removeSpecialEscapes('\\c{red}\\c', delays, colorSpans);
                expect(result).toEqual('');
                expect(colorSpans).toEqual([ { colorId: 'red', offs: 0, count: 0 } ]);
            });
        });

        describe('mixed delay and color escapes', () => {

            it('handles a delay followed by a color span', () => {
                const delays: BreakApartDelay[] = [];
                const colorSpans: ColoredTextSpan[] = [];
                const result = Bubble.removeSpecialEscapes(
                    'Wait\\d then \\c{red}stop\\c',
                    delays,
                    colorSpans,
                );
                expect(result).toEqual('Wait then stop');
                expect(delays).toEqual([ { offs: 4, millis: 500 } ]);
                expect(colorSpans).toEqual([ { colorId: 'red', offs: 10, count: 4 } ]);
            });

            it('handles a color span followed by a delay', () => {
                const delays: BreakApartDelay[] = [];
                const colorSpans: ColoredTextSpan[] = [];
                const result = Bubble.removeSpecialEscapes(
                    '\\c{red}go\\c\\d{300} now',
                    delays,
                    colorSpans,
                );
                expect(result).toEqual('go now');
                expect(colorSpans).toEqual([ { colorId: 'red', offs: 0, count: 2 } ]);
                expect(delays).toEqual([ { offs: 2, millis: 300 } ]);
            });
        });
    });
});
