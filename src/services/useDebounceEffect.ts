import { useEffect, DependencyList } from 'react'

export const useDebounceEffect = (
    fn: () => void,
    waitTime: number,
    deps?: DependencyList,
) => {
    useEffect(() => {
        const t = setTimeout(() => {
            fn.apply(undefined, deps as [])
        }, waitTime)

        return () => {
            clearTimeout(t)
        }
    }, deps)
}
