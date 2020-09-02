/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="@svgr/webpack" />
declare module '*.svg' {
    const value: React.StatelessComponent<React.SVGAttributes<SVGElement>>;
    export default value;
}