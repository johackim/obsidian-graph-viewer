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

    const [displayWidth] = useState(window.innerWidth);
    const [displayHeight] = useState(window.innerHeight);
    const [hoverNode, setHoverNode] = useState(null);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        ref.current.d3Force('x', d3.forceX());
        ref.current.d3Force('y', d3.forceY());
        ref.current.d3Force('link').distance(70);
        ref.current.d3Force('center', null);
        ref.current.d3Force('charge').strength(-100);

        setTimeout(() => {
            ref.current.zoomToFit(200, 20);
        });
    }, []);

    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());

    const handleNodeHover = (node) => {
        highlightNodes.clear();
        highlightLinks.clear();

        setHoverNode(node);

        if (node) {
            highlightNodes.add(node);
            (node.neighbors || []).forEach((neighbor) => highlightNodes.add(neighbor));
            (node.links || []).forEach((link) => highlightLinks.add(link));
        }

        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
    };

    return (
        <ForceGraph2D
            ref={ref}
            graphData={data}
            width={displayWidth - 1}
            height={displayHeight - 1}
            style={{ maxWidth: '100%', height: 'auto' }}
            backgroundColor="#101821"
            nodeColor={(node) => {
                if (hoverNode) {
                    const hoverNodeNeighbors = (hoverNode.neighbors || []).map(({ id }) => id);

                    if (node !== hoverNode && !hoverNodeNeighbors.includes(node.id)) {
                        return 'rgba(255, 255, 255, 0.2)';
                    }
                }

                return highlightNodes.has(node) ? '#00A2A5' : '#425563';
            }}
            linkColor={(link) => (highlightLinks.has(link) ? '#00A2A5' : '#4A5563')}
            nodeCanvasObjectMode={() => 'after'}
            onNodeHover={handleNodeHover}
            onNodeDrag={handleNodeHover}
            onNodeDragEnd={() => {
                setHoverNode(null);
                highlightNodes.clear();
                highlightLinks.clear();
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.id;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'white';
                ctx.transition = 'opacity .3s';

                if (hoverNode) {
                    const hoverNodeNeighbors = (hoverNode.neighbors || []).map(({ id }) => id);

                    if (node !== hoverNode && !hoverNodeNeighbors.includes(node.id)) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    }
                }

                ctx.fillText(label, node.x, node.y + 8);
            }}
        />
    );
};

export default IndexPage;
