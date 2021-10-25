import React, { useRef, useEffect, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import * as d3 from 'd3';
import 'normalize.css';

import data from '../../data.json';

data.links.forEach((link) => {
    const a = data.nodes.find((node) => node.id === link.source);
    const b = data.nodes.find((node) => node.id === link.target);

    if (a && !a?.neighbors) a.neighbors = [];
    if (b && !b?.neighbors) b.neighbors = [];

    a?.neighbors.push(b);
    b?.neighbors.push(a);

    if (a && !a?.links) a.links = [];
    if (b && !b?.links) b.links = [];

    a?.links.push(link);
    b?.links.push(link);
});

const IndexPage = () => {
    const ref = useRef();

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        ref.current.d3Force('x', d3.forceX());
        ref.current.d3Force('y', d3.forceY());
    }, []);

    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [, setHoverNode] = useState(null);

    const updateHighlight = () => {
        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
    };

    const handleNodeHover = (node) => {
        highlightNodes.clear();
        highlightLinks.clear();

        if (node) {
            highlightNodes.add(node);
            node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
            node.links.forEach((link) => highlightLinks.add(link));
        }

        setHoverNode(node || null);
        updateHighlight();
    };

    return (
        <ForceGraph2D
            ref={ref}
            graphData={data}
            nodeColor={(node) => (highlightNodes.has(node) ? '#7A6AE6' : '#7B7D8C')}
            linkColor={(link) => (highlightLinks.has(link) ? '#7A6AE6' : '')}
            nodeCanvasObjectMode={() => 'after'}
            onNodeHover={handleNodeHover}
            nodeCanvasObject={(node, ctx, globalScale) => {
                const opacity = globalScale * 0.1 * 2;

                const label = node.id;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                ctx.fillText(label, node.x, node.y + 8);
            }}
        />
    );
};

export default IndexPage;
