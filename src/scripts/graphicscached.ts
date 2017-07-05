// graphicscached.ts

interface Graphics {
    visible: boolean;
    clear(): void;
}

class GraphicsCached<T extends Graphics> {
    private isSwitched: boolean;
    private graphicsA: T;
    private graphicsB: T;
    constructor(type: { new(): T ;}) {
        this.isSwitched = false;
        this.graphicsA = new type();
        this.graphicsB = new type();
    } // constructor

    switchCache() {
        if (!this.isSwitched) {
            this.graphicsA.visible = false;
            this.graphicsB.visible = true;
        }
        else {
            this.graphicsA.visible = true;
            this.graphicsB.visible = false;
        }
        this.isSwitched != this.isSwitched;
    } // switchCache

    getGraphics() {
        if (!this.isSwitched) {
            return this.graphicsA;
        }
        else {
            return this.graphicsB;
        }
    } // getGraphics

    getCache() {
        if (!this.isSwitched) {
            return this.graphicsB;
        }
        else {
            return this.graphicsA;
        }
    } // getCache

    clearGraphcis() {
        this.getGraphics().clear();
    } // clearGraphics

    clearCache() {
        this.getCache().clear();
    } // clearCache
} // GraphicsCached

export = GraphicsCached;
