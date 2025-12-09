import { BitmapFont, Delay } from 'gtp';
import { DwGame } from './DwGame';

export interface BreakApartDelay {
    offs: number;
    millis: number;
}

export interface BreakApartResult {
    lines: string[];
    delays: BreakApartDelay[];
}

/**
 * A base class for all bubbles in the game (e.g. white text
 * against a black background).
 */
export class Bubble {

    game: DwGame;
    title?: string;
    x: number;
    y: number;
    w: number;
    h: number;

    /**
     * The width of the game's font. Cached for performance.
     */
    private readonly fontWidth: number;

    /**
     * How much to paint vertically of this bubble. Only used when
     * it is animating in.
     */
    private paintH?: number;

    /**
     * Animates the initial rendering of this bubble. Bubbles in Dragon
     * Warrior expand vertically before initially rendering.
     */
    private animator?: Delay;

    /**
     * Toggles the blinking state of the arrow in this bubble, if any.
     */
    private arrowDelay?: Delay;

    /**
     * Whether the arrow in this bubble, if any, should be painted.
     * Toggled by <code>arrowDelay</code>.
     */
    private paintArrow = false;

    static readonly ARROW_MARGIN: number = 14; // 6 * SCALE; TODO

    constructor(game: DwGame, title: string | undefined, x: number, y: number, w: number, h: number) {

        this.game = game;
        this.title = title;
        const scale = 1; //game.scale;
        this.x = x * scale;
        this.y = y * scale;
        this.w = w * scale;
        this.h = h * scale;
        this.init();

        const font: BitmapFont = this.game.assets.get('font'); // Need to split this to appease linter
        this.fontWidth = font.cellW;
        this.setActive(true);
    }

    protected breakApart(text: string, w: number): BreakApartResult {

        const result: BreakApartResult = { lines: [], delays: [] };

        // Newlines are automatic line breaks
        text = Bubble.removeSpecialEscapes(text, result.delays);
        const lineList: string[] = text.split('\n');

        lineList.forEach((line) => {
            this.breakApartLine(line, w, result);
        });
        return result;
    }

    /**
     * Locates special escapes in text and adds entries into the appropriate
     * arrays (delays, font color changes, etc.).
     *
     * @param text The text to scan.
     * @param delays The array to put delays into.
     * @return The text, with any escapes removed.
     */
    static removeSpecialEscapes(text: string, delays: BreakApartDelay[]) {

        // Delay formats:
        //    \d      - default ms
        //    \d- 300 ms

        let delay: number;
        let index: number;
        let lastOffs = 0;
        while ((index = text.indexOf('\\d', lastOffs)) > -1) {

            if (index + 2 < text.length && text.charAt(index + 2) === '{') {
                const end: number = text.indexOf('}', index + 3);
                if (end > -1) {
                    delay = parseInt(text.substring(index + 3, end), 10);
                    console.log(`Adding a delay of ${delay} ms`);
                    delays.push({ offs: index, millis: delay });
                    text = text.substring(0, index) + text.substring(end + 1);
                } else {
                    console.warn(`Suspicious, apparent unclosed delay at offset ${index}`);
                }
            } else {
                delay = 500;
                console.log(`Adding the default delay of ${delay} ms`);
                delays.push({ offs: index, millis: delay });
                text = text.substring(0, index) + text.substring(index + 2);
            }

            lastOffs = index;
        }

        return text;
    }

    private breakApartLine(line: string, w: number, result: BreakApartResult) {

        const optimal: number = Math.floor(w / this.fontWidth);

        while (line.length > optimal) {

            let offs: number = optimal - 1;
            let ch: string = line.charAt(offs);
            while (ch !== ' ') {
                ch = line.charAt(--offs);
            }
            result.lines.push(line.substring(0, offs));

            line = line.substring(offs).trim();
        }

        //if (line.length>0) {
        result.lines.push(line);
        //}
    }

    protected drawArrow(x: number, y: number) {
        if (this.paintArrow) {
            this.game.drawArrow(x, y);
        }
    }

    protected drawDownArrow(x: number, y: number) {
        if (this.paintArrow) {
            this.game.drawDownArrow(x, y);
        }
    }

    private getDefaultTextColor(): string {
        return this.game.hero.isDead() ? 'rgb(255, 0, 0)' : 'rgb(255, 255, 255)';
    }

    getXMargin(): number {

        const scale: number = this.game.scale;

        // Left inset + border thickness + 13 pixels of spacing
        return (1 + 2) * scale + 13 * scale;
    }

    getYMargin(): number {

        if (this.title) {
            return this.game.getTileSize();
        }

        const scale: number = this.game.scale;

        // Top inset + border thickness + 5 pixels of spacing
        return (1 + 2) * scale + 5 * scale;
        //return this.title ? this.game.getTileSize() : (8 * this.game.scale);
    }

    init() {
        this.initAnimation();
    }

    private initAnimation() {
        this.paintH = 0;
        this.animator = new Delay({
            millis: 20, loop: true,
            callback: () => {
                this.paintH = Math.min(this.paintH! + this.game.getTileSize(), this.h);
                //console.log('--- ' + self._paintH);
                if (this.paintH >= this.h) {
                    delete this.animator;
                    delete this.paintH;
                }
            },
        });
    }

    private isAnimating(): boolean {
        return !!this.animator;
    }

    paint(ctx: CanvasRenderingContext2D) {

        if (this.animator) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.paintH!);
            //console.log('Setting clip to: ' + this.x + ',' + this.y + ',' + this.w + ',' + this._paintH);
            ctx.clip();
        }

        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        this.paintBorder(ctx);

        if (this.title) {
            this.paintTitle(ctx);
        }

        if (!this.isAnimating()) {
            this.paintContent(ctx, this.x + this.getXMargin(), this.y + this.getYMargin());
        }

        if (this.animator) {
            ctx.restore();
        }
    }

    private paintBorder(ctx: CanvasRenderingContext2D) {

        ctx.fillStyle = 'rgb(255,255,255)';
        const scale: number = this.game.scale;
        const insets: number = scale;
        const lineSize: number = 2 * scale;

        // top
        let x: number = this.x + insets + lineSize / 2;
        let y: number = this.y + insets;
        ctx.fillRect(x, y, this.w - 2 * lineSize, lineSize);

        // bottom
        y = this.y + this.h - insets - lineSize;
        ctx.fillRect(x, y, this.w - 2 * lineSize, lineSize);

        // right
        x = this.x + this.w - insets - lineSize;
        y = this.y + lineSize;
        ctx.fillRect(x, y, lineSize, this.h - 2 * lineSize);

        // left
        x = this.x + insets;
        ctx.fillRect(x, y, lineSize, this.h - 2 * lineSize);

        // Four dots in inner corners
        ctx.fillRect(this.x + insets + lineSize, this.y + insets + lineSize,
            scale, scale); // top-left
        ctx.fillRect(this.x + this.w - insets - lineSize - scale, this.y + insets + lineSize,
            scale, scale); // top-right
        ctx.fillRect(this.x + this.w - insets - lineSize - scale, this.y + this.h - insets - lineSize - scale,
            scale, scale); // bottom-right
        ctx.fillRect(this.x + insets + lineSize, this.y + this.h - insets - lineSize - scale,
            scale, scale); // bottom-left
    }

    /**
     * Paints the content of this bubble. Subclasses should override.
     *
     * @param ctx The context to paint into.
     * @param x The x-offset at which text should be painted. Selection arrows can be
     *        to the left of this.
     * @param y The y-offset at which to start painting.
     */
    paintContent(ctx: CanvasRenderingContext2D, x: number, y: number) {
        // Should be overridden
    }

    private paintTitle(ctx: CanvasRenderingContext2D) {

        const scale: number = this.game.scale;
        const fontHeight: number = this.game.stringHeight();

        ctx.fillStyle = 'rgb(0,0,0)';
        let stringW: number = this.game.stringWidth(this.title);
        stringW += 4 * scale;
        const x: number = this.x + Math.floor((this.w - stringW) / 2);
        ctx.fillRect(x, this.y, stringW, fontHeight);

        ctx.fillStyle = this.getDefaultTextColor();
        this.game.drawString(this.title!, x + 2 * scale, this.y);
    }

    protected resetArrowTimer() {
        this.paintArrow = true;
        this.arrowDelay?.reset();
    }

    setActive(active: boolean) {
        if (active !== !!this.arrowDelay) {
            if (active) {
                this.paintArrow = true;
                this.arrowDelay = new Delay({
                    millis: [ 500, 300 ],
                    loop: true,
                    callback: () => {
                        this.paintArrow = !this.paintArrow;
                    },
                });
            } else {
                this.paintArrow = true;
                this.arrowDelay = undefined;
            }
        }
    }

    /**
     * Updates this bubble.  This method should not be overridden; subclasses
     * should override <code>updateImpl()</code> instead.
     *
     * @param delta The amount of time that elapsed since the last call
     *        to this method.
     * @see updateImpl()
     */
    update(delta: number) {
        if (this.animator) {
            //console.log(this.title + ' - updating animator with delta === ' + delta);
            this.animator.update(delta);
        } else {
            this.arrowDelay?.update(delta);
            this.updateImpl(delta);
        }
    }

    /**
     * Updates this bubble.  Subclasses should override this method to perform
     * any custom logic.
     *
     * @param delta The amount of time that elapsed since the last call
     *        to this method.
     * @see update()
     */
    updateImpl(delta: number) {
        // Should be overridden
    }
}
