import React, { useRef, useEffect } from 'react';
import './NestedChart.css'
import * as d3 from 'd3';

const NestedChart = ({ data }) => {
    const svgRef = useRef();
    const ttipRef = useRef(); 
    const partition = (data) => {
        console.log(data)

        const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
        console.log(root)
        return d3.partition()
            .size([2 * Math.PI, root.height + 2])
            (root);
    }
    const width = 500
    const height = 475
    const radius = (Math.min(width, height) / 10) - 10;
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 2))
    const format = d3.format(",d")
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 20)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 3))

    useEffect(() => {
        svgRef.current.innerHTML='';
            
        const arcVisible = d => {
            return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
        }
        const labelVisible = d => {
            return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        }
        const labelTransform = d => {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * radius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
          
        }

        const clicked = (event, p) => {
            parent.datum(p.parent || root);
            root.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });
            const t = g.transition().duration(750);
            path.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .filter(function (d) {
                    return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")

                .attrTween("d", d => () => arc(d.current));

            label.filter(function (d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));
        }
        const mouseOver=(event, p)=>{

            var total = p.parent.value;
            var percent = Math.round(1000 * p.value / total) / 10;
            tooltip.select('.label').html(p.data.name);            
            tooltip.select('.count').html(p.value);     
            tooltip.select('.percent').html(percent + '%');      
            tooltip.style('display', 'block');  
        }
        const mouseOut=(event, p)=>{
            tooltip.style('display', 'none'); 
        }
        const mouseMove=(event, p)=>{
            tooltip.style('top', (event.layerY + 15) + 'px'); 
            tooltip.style('left', (event.layerX + 15) + 'px');
        }   
        const tooltip = d3.select(ttipRef.current) 
            .classed('tooltip', true);   
        tooltip.append('div')
            .attr('class', 'label');                
        tooltip.append('div')
            .attr('class', 'percent');
        const root = partition(data);
        root.each(d => d.current = d);
        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .style("font", "5px sans-serif")
        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${width / 2})`)
        const path = g.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => {
               console.log( d.children)
                if(d.depth === 1){
                    return color (d.data.name)
                }
                else if(d.depth === 2){
                    return color (d.data.name)
                }
                else if(d.depth === 3){
                    return color (d.data.name)
                }
                else if(d.depth === 4){
                    return color (d.data.name)
                }
            })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")

            .attr("d", d => arc(d.current));

        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked)
            .on('mouseover', mouseOver)
            .on('mouseout',mouseOut)
            .on('mousemove',mouseMove);

        const label = g.append("g")
        
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => +labelVisible(d.current))
            .attr("transform", d => labelTransform(d.current))
            .text(d => {
                return `${d.data.name}`
            })


        const parent = g.append("circle")
            .datum(root)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked)

    }, [data])
    return (
        <>
        <div ref={ttipRef}></div>
        <svg ref={svgRef}></svg>
        </>
    )
}

export default NestedChart;