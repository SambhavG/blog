---
title: Sorting Medals
description: Every possible way to rank the Olympic teams, now in 3D
date: '2024-08-31'

published: true
---

This is a quick writeup about a [visualization](https://sambhavg.github.io/medals) I made a couple weeks ago where I used three.js to put together an interactive 3D layer cake of medal sorting schemes, where each scheme assigned a different value to silver and bronze medals with respect to gold. The visualization was inspired by a [New York Times](https://www.nytimes.com/interactive/2024/07/29/upshot/olympics-medal-table-paris.html) piece in which they identified that most of the schemes for ranking Olympic teams by the number of gold, silver, and bronze medals are actually just points in a 2D space, where one dimension is the value of silver with respect to gold, and the other is the value of bronze with respect to silver. 

This accounts for all points-based schemes - you can come up with weirder schemes like points = gold^3 + silver^2 + bronze, but most schemes fall somewhere on this 2D plane. If we add the restriction that better medals are always worth at least as many points, we get a quarter of a plane, and if we scale the axis in the other direction exponentially, we get an enclosed square.

The NYT shows all their squares separately, but you can actually interleave the planes with each other by representing placement with not color, but height. This is what I do with my visualization: I keep the medal value axes the same, but I stack the planes in 3D so you can see all of the rankings at once. I don't claim it's easier to understand than the NYT version (it's probably much harder), but that's the idea. I also smooth out the planes so they don't sharply snap up and down at the border lines you can see in the NYT version.