type CSSModuleClasses = {
    readonly [key: string]: string
}

declare module '*.module.css' {
    const classes: CSSModuleClasses
    export default classes
}

declare module '*.module.scss' {
    const classes: CSSModuleClasses
    export default classes
}

declare module '*.module.sass' {
    const classes: CSSModuleClasses
    export default classes
}

declare module '*.module.less' {
    const classes: CSSModuleClasses
    export default classes
}

declare module '*.module.styl' {
    const classes: CSSModuleClasses
    export default classes
}
