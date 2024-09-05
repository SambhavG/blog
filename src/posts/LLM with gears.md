---
title: Building a Mechanical LLM
description: How many gears would it take to build a modern LLM?
date: '2024-07-05'
  
published: false
---
## Contents

## Introduction
You're a \[era before computers were invented\] century metallurgist who's a master of their craft, particularly skilled at producing very accurately machined gears. One day, printed on 256 million double-sided sheets of paper (assuming 2,500 characters per side of page), you stumble across the weights of Llama 3 8B, along with a document explaining the role of each number in the computation. With the help of a mathematician friend, you fully understand the computation graph of the LLM. Could you build Llama 3 8B with gears?

Obviously we're going to need a lot of simplification of details here - I'm looking for a roughly correct order estimate of the number of gears required to pull this off.


One thing I could do is just look at (1) the number of gears required for a floating point operation (FLOP) and (2) number of FLOPs in a modern LLM, and I'd get an interesting number, but I'd like to go in more detail than that.

## One FLOP

Let's say we have two numbers x and y between -1 and 1 which we want to multiply together. The value of y will be completely static and non-programmable, like a weight of the model, and x will be dynamic and provided as input via the rotation of an axle (so the axle will be rotated x times). We need to rotate a rod by xy rotations.

This is pretty simple in gear arithmetic: if gear A has m teeth and gear B has n teeth, then one rotation of gear A will lead to m teeth meshing with gear B, on which the number of rotations of gear B will be one for every set of n teeth on it that end up meshing with gear A, so m/n total rotations on gear B. Now we need to find m and n such that (1) the gears physically work, and (2) x*m/n = xy. We need m/n = y, so m = ny. We know bounds on y, so we just need to set m to an arbitrary number like 20 and n to 20/y. For cases where y is really small, creating an unreasonably large gear B, we could gear down until each gear in the chain had a reasonable number of teeth; I'll multiply by a scaling factor of 1.2 to account for this. If y is negative, we can add a second gear to flip the sign; let's assume half of the model's multiplicative weights are negative (I'm not going to check this against the real weights) and multiply by 1.25.

In general, we need about 3 gears to convert a rotation of some amount into a rotation of that amount multiplied by a fixed floating point number that we know in advance.

Addition is tricky, because we generally want control over both (or all) inputs. To add numbers, we'll probably need to have the input gears couple and decouple with an output gear one by one. We'll assume we have someone who can pull some levers to make this happen seamlessly. To add n numbers, we'll need n+1 gears for a gear on each of the n input axles and one on the output axle (all of these gears will be the same size; they can either be arranged all on the same plane as the output or the output gear can be really tall).

## Matrix Multiplication

Let's multiply two matrices of size m x n and n x k. Using the default matrix multiplication algorithm, this requires mnk multiplications and mk different n-additions (one for each element of the output matrix) so in total we'll need 3mnk + m(n+1)k = mk(4n+1) gears.

## Attention

For the attention operation, there's some more moving parts. 