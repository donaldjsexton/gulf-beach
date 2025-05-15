declare module '@editorjs/embed' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs'
  export default class Embed implements BlockTool {
    static get toolbox(): { title: string; icon: string }
    constructor({ data }: { data: BlockToolData })
    render(): HTMLElement
    save(blockContent: HTMLElement): BlockToolData
    validate(data: BlockToolData): boolean
  }
}

declare module '@editorjs/list' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs'
  export default class List implements BlockTool {
    static get toolbox(): { title: string; icon: string }
    constructor({ data }: { data: BlockToolData })
    render(): HTMLElement
    save(blockContent: HTMLElement): BlockToolData
    validate(data: BlockToolData): boolean
  }
}

declare module '@editorjs/image' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs'
  export default class Image implements BlockTool {
    static get toolbox(): { title: string; icon: string }
    constructor({ data }: { data: BlockToolData })
    render(): HTMLElement
    save(blockContent: HTMLElement): BlockToolData
    validate(data: BlockToolData): boolean
  }
}

declare module '@editorjs/quote' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs'
  export default class Quote implements BlockTool {
    static get toolbox(): { title: string; icon: string }
    constructor({ data }: { data: BlockToolData })
    render(): HTMLElement
    save(blockContent: HTMLElement): BlockToolData
    validate(data: BlockToolData): boolean
  }
} 