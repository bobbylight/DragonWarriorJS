import DwGame from './DwGame';
import { BitmapFont, Delay } from 'gtp';

export default class Bubble {

    game: DwGame;
    title: string | undefined;
    x: number;
    y: number;
    w: number;
    h: number;
    private readonly _fontWidth: number;
    private _paintH?: number;
    private _animator?: Delay;

    static readonly MARGIN: number = 10; // 5 * SCALE; TODO

    constructor(title: string | undefined, x: number, y: number, w: number, h: number) {

        this.game = (window as any).game;
        this.title = title;
        const scale: number = 1; //game.scale;
        this.x = x * scale;
        this.y = y * scale;
        this.w = w * scale;
        this.h = h * scale;
        this.init();

        const font: BitmapFont = this.game.assets.get('font'); // Need to split this to appease linter
        this._fontWidth = font.cellW;

//      int strokeW = 2 * SCALE;
//      borderStroke = new BasicStroke(strokeW, BasicStroke.CAP_ROUND,
//                              BasicStroke.JOIN_ROUND);
    }

    _breakApart(text: string, w: number): any {

        const result: any = {lines: [], delays: []};

        // Newlines are automatic line breaks
        text = Bubble._removeSpecialEscapes(text, result.delays);
        const lineList: string[] = text.split('\n');

        lineList.forEach(line => this.breakApartLine(line, w, result));
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
    static _removeSpecialEscapes(text: string, delays: any[]) {

        // Delay formats:
        //    \d      - default ms
        //    \d- 300 ms

        let delay: number;
        let index: number;
        let lastOffs: number = 0;
        while ((index = text.indexOf('\\d', lastOffs)) > -1) {

            if ((index + 2) < text.length && text.charAt(index + 2) === '{') {
                const end: number = text.indexOf('}', index + 3);
                if (end > -1) {
                    delay = parseInt(text.substring(index + 3, end), 10);
                    console.log('Adding a delay of ' + delay + ' ms');
                    delays.push({offs: index, millis: delay});
                    text = text.substring(0, index) + text.substring(end + 1);
                } else {
                    console.warn('Suspicious, apparent unclosed delay at offset ' + index);
                }
            } else {
                delay = 500;
                console.log('Adding the default delay of ' + delay + ' ms');
                delays.push({offs: index, millis: delay});
                text = text.substring(0, index) + text.substring(index + 2);
            }

            lastOffs = index;
        }

        return text;
    }

    private breakApartLine(line: string, w: number, result: any) {

        const optimal: number = Math.floor(w / this._fontWidth);

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

    _getDefaultTextColor(): string {
        return this.game.hero.isDead() ? 'rgb(255, 0, 0)' : 'rgb(255, 255, 255)';
    }

    init() {
        this._initAnimation();
    }

    _initAnimation() {
        this._paintH = 0;
        this._animator = new Delay({
            millis: 20, loop: true,
            callback: () => {
                this._paintH = Math.min(this._paintH! + this.game.getTileSize(), this.h);
                //console.log('--- ' + self._paintH);
                if (this._paintH >= this.h) {
                    delete this._animator;
                    delete this._paintH;
                }
            }
        });
    }

    paint(ctx: CanvasRenderingContext2D) {

        if (this._animator) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this._paintH!);
            //console.log('Setting clip to: ' + this.x + ',' + this.y + ',' + this.w + ',' + this._paintH);
            ctx.clip();
        }

        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        this.paintBorder(ctx);

        if (this.title) {
            this.paintTitle(ctx);
        }

        if (!this._isAnimating()) {
            this.paintContent(ctx, this.x + this.getXMargin(), this.y + this.getYMargin());
        }

        if (this._animator) {
            ctx.restore();
        }
    }

    private paintBorder(ctx: CanvasRenderingContext2D) {

        ctx.fillStyle = 'rgb(255,255,255)';
        const scale: number = this.game.scale;
        const insets: number = scale;
        const lineSize: number = 2 * scale;

        // top
        let x: number = this.x + insets + (lineSize / 2);
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

        ctx.fillStyle = this._getDefaultTextColor();
        this.game.drawString(this.title!, x + 2 * scale, this.y);
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
        return (1 + 2) * scale + (5 * scale);
        //return this.title ? this.game.getTileSize() : (8 * this.game.scale);
    }

    _isAnimating(): boolean {
        return !!this._animator;
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
        if (this._animator) {
            //console.log(this.title + ' - updating animator with delta === ' + delta);
            this._animator.update(delta);
        } else {
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
