'use client'

import { useEffect, useState, useRef } from "react"
import { useCursors } from "./cursors-context"
import OtherCursor from "./other-cursor"
import SelfCursor from "./self-cursor"

import * as d3 from 'd3';
import { Delaunay } from "d3-delaunay"

function Voronoi(props: {svgRef: React.RefObject<SVGSVGElement>, windowDimensions: { width: number, height: number }}) {
    const { others, self } = useCursors()
    const [points, setPoints] = useState<number[][]>([])
    const { svgRef, windowDimensions } = props
    const [svgPath, setSvgPath] = useState<string>("")

    useEffect(() => {
        // If there aren't any other points, put a virtual point in the center of the window so the user has something to play with
        let points = Object.values(others).map(({ x, y }) => [x * windowDimensions.width, y * windowDimensions.height]);
        if (self) {
            points.push([self.x * windowDimensions.width, self.y * windowDimensions.height])
        }
        if (points.length <= 1) {
            points.push([windowDimensions.width/2, windowDimensions.height/2])
        }
        setPoints(points)
    }, [others, self, windowDimensions])

    useEffect(() => {
        const svg = d3.select(svgRef.current)
        svg.attr('width', windowDimensions.width).attr('height', windowDimensions.height)
        svg.attr('viewBox', `0 0 ${windowDimensions.width} ${windowDimensions.height}`)

        // @ts-ignore
        const delaunay = Delaunay.from(points);
        const voronoi = delaunay.voronoi([0, 0, windowDimensions.width, windowDimensions.height]);

        const pattern = (i: number) => {
            return i % 2 === 0 ? "url(#diagonal-stripe-1)" : "url(#diagonal-stripe-4)"
        }

        // Go from an index i to a pastel color
        // The trick is to work in HSL, fixing S and L, and using i to pick a hue
        // Then convert back to RGB hex
        const pastel = (i: number) => {
            const hue = (i * 137.508) % 360
            return d3.hsl(hue, 0.5, 0.8).formatHex()
        }

        svg.selectAll('path')
        // Construct a data object from each cell of our voronoi diagram
        .data( points.map((d,i) => voronoi.renderCell(i)) )
        .join('path')
          .attr('d', d => d)
          .style('fill', (d,i) => pastel(i))
          .style('opacity', 0.8)
          .style('stroke', 'white')
          .style('stroke-opacity', 0.9)
  

        const svgPath = voronoi.render();
        setSvgPath(svgPath)
    }, [points, svgRef, windowDimensions])

    if (!svgRef.current) return null

    return (
        <path d={svgPath} fill="none" stroke="black" />
    )
}

export default function SharedSpace() {
    const { others, self } = useCursors()
    const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
    const svgRef = useRef<SVGSVGElement>(null);
    const svgParentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onResize = () => {
            setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
        }
        window.addEventListener("resize", onResize)
        onResize()
        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, [])

    useEffect(() => {
        // Add the class 'overflow-hidden' on body to prevent scrolling
        document.body.classList.add("overflow-hidden")
        // Scroll to top
        window.scrollTo(0, 0)
        return () => {
            document.body.classList.remove("overflow-hidden")
        }
    }, [])

    const count = Object.keys(others).length + (self ? 1 : 0)

    return (
        <>
            <div ref={svgParentRef} className="-z-10 absolute top-0 left-0 w-full h-full bg-stone-200 overflow-clip">
                { count > 0 && <div className="absolute top-4 left-4 pointer-events-none flex items-center">
                    <span className="text-2xl">{count}&times;</span><span className="text-5xl">🎈</span>
                </div> }
                <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" version="1.1">
                    <defs>
                        <pattern id="diagonal-stripe-1" patternUnits="userSpaceOnUse" width="10" height="10">
                            <image xlinkHref="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScvPgogIDxwYXRoIGQ9J00tMSwxIGwyLC0yCiAgICAgICAgICAgTTAsMTAgbDEwLC0xMAogICAgICAgICAgIE05LDExIGwyLC0yJyBzdHJva2U9J2JsYWNrJyBzdHJva2Utd2lkdGg9JzEnLz4KPC9zdmc+Cg==" x="0" y="0" width="10" height="10"></image>
                        </pattern>
                        <pattern id="diagonal-stripe-4" patternUnits="userSpaceOnUse" width="10" height="10">
                            <image xlinkHref="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSdibGFjaycvPgogIDxwYXRoIGQ9J00tMSwxIGwyLC0yCiAgICAgICAgICAgTTAsMTAgbDEwLC0xMAogICAgICAgICAgIE05LDExIGwyLC0yJyBzdHJva2U9J3doaXRlJyBzdHJva2Utd2lkdGg9JzMnLz4KPC9zdmc+" x="0" y="0" width="10" height="10"></image>
                        </pattern>
                    </defs>
                    { windowDimensions.width > 0 && <Voronoi svgRef={svgRef} windowDimensions={windowDimensions} /> }
                </svg>
            </div>

            { Object.keys(others).map((id) => <div key={id}><OtherCursor id={id} windowDimensions={windowDimensions} fill="#06f" /></div>) }
            { self?.pointer === "touch" && <SelfCursor windowDimensions={windowDimensions} /> }
        </>
    )
}