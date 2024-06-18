---
title: I tried Bend
description: I tried Bend
date: '2024-6-16'
categories:
  - Bend
  - Programming
published: true
---
I decided to try the new [Bend](https://github.com/HigherOrderCO/Bend) programming language. Bend aims to be parallel by default: "if your code _can_ run in parallel, it _will_ run in parallel", but also as easy to write as Python.

Disclaimer: this post almost certainly has errors and misunderstandings about Bend. My background is as a university math/CS student with some functional programming knowledge.
## Quick background
Bend uses two keywords not common in mainstream languages: _fold_ and _bend_. The idea of _fold_ is to essentially do a Ctrl+F find and replace in a recursive data structure: if I wanted to replace all the leaf nodes in a tree with their doubles, I would compute something like
```python
# Default type Tree
type Tree:
  Node { ~left, ~right }
  Leaf { value }

def doubleTree(t):
	fold t:
		case Tree/Node:
			return Tree/Node(t.left, t.right)
		case Tree/Leaf:
			return Tree/Leaf(t.value * 2)
```
Several important things to note here:
- When we have our Tree t, we treat it like a linked list where we "go to" its left and right nodes whenever it's not a leaf, and we double whenever we are at the leaf.
- The unseen bit of logic here is that whenever we write t.left, or t.right, since those are defined to be recursive (as denoted by the ~ in the default type definition), they are Trees themselves. Thus, the _fold_ folds back and runs the whole chunk of logic on that object too. The Leaf case terminates because value is not a recursive entry. This is essentially a BFS on the tree, where each branch can be computed in parallel, and opportunities for parallel computing like this are how Bend is able to multithread programs.

The _bend_ operation is somewhat similar, but it's used to build up a structure rather than operate on an existing one. The following _bend_ creates a tree of depth d:
```python
def makeTree(d):
	bend d:
		when d > 0:
			t = Tree/Node(fork(d-1), fork(d-1))
		else:
			t = Tree/Leaf(1)
	return t
```
Here, _fork_ is used to build another tree with a different argument to bend; each fork loops back to the beginning of bend.
## Goal
I'm going to try to implement a function which multiplies two matrices. 
## Shortfall 1: You can't really use lists
The first thing I tried was to naturally represent my vectors and matrices as lists and lists of lists respectively. This has a big problem. In Bend, Lists are linked lists. Each list is just the first number and a reference to the rest of the list. To compute the dot product of two equal length lists, we'd compute:
```python
def dot(v1, v2):
	match v1:
		case List/Nil:
			return 0
		case List/Cons:
			match v2:
				case List/Nil:
					return 0 #should never get here
				case List/Cons:
					return v1.head*v2.head+dot(v1.tail,v2.tail)
```
(Note: each List is either a List/Nil or a List/Cons, where List/Nil is an empty list and List/Cons is not. When our tail is empty, it will be a List/Nil)

This computation is very sequential, because if the entry-wise products were 1, 2, 3, 4, 5, 6, 7, we'd end up with the sum 1+ (2+ (3+ (4+ (5+ (6 + 7))))), which must be summed in consecutive order. Bend has no way to optimize a computation like this, as each + depends on another + to complete first. 

It seems like any computation involving lists will take O(n) time - for this reason, I struggle to think of a situation where the List datatype would ever be useful in a language like Bend, assuming A) it is not used simply as an O(1) sized tuple, and B) the programmer who chose Bend would like to take full advantage of Bend's main feature. I mention a caveat in Shortfall 3.
## Shortfall 2: Maps are tricky
Bend also has a map datatype. This map works similar to normal maps or dictionaries in other languages, and in theory can be used to simulate an indexable list which avoids the shortfall of regular (linked) Lists.

Maps represent the data as a binary tree, where each node is either a Node or a Leaf. Leaves don't contain anything, they're just end caps; each Node contains a value (either * or an actual value) and a reference to left and right nodes. Keys are managed by some scheme which I couldn't completely reverse engineer, but each node with some non-* value corresponds directly with some valid key.
### Approach 1: Direct traversal
I directly use the map structure as a vector and compute dot product recursively. The issue here is that while I can "match" the difference between a Leaf and a Node, I can't match the difference between a * and an actual value, so I couldn't find a way to compute dot product recursively as v1.value * v2.value + dot(v1.left, v2.left) + dot(v1.right, v2.right) without the * valued nodes getting in the way.
### Approach 2: Mergesort style
Alternatively, I can use the map indexing syntax. My function should take the dot product of the left half and right half of the first map with the left half and right half of the second map respectively.
```python
def dotProduct(v1, v2, l, r):
  if l == r:
    return v1[l] * v2[r]
  else:
    return dotProduct(v1, v2, l, (l+r)/2) + dotProduct(v1, v2, (l+r)/2+1, r)
```
This turns out to work, but it's a bit less efficient than approach 1 would have been - while approach 1 would traverse the tree just once, this approach has to fetch every element individually starting from the top - a slowdown of log n.

We also have to do some tricky operations to later on when working with full matrices. When we have a vector and a matrix, the dot product of the vector with each row of the matrix gives a number corresponding to each row. We need to somehow merge these dot products into one vector which has the correct indexing.

The best (and only), but still problematic way I found to do this was to merge two vectors (and later, two matrices) by pushing one element of the second vector into the first vector, then recursing until the first vector has all of the second vector's elements. This requires that the second vector has nonstandard map indices starting at whatever the first vector ends at, or else alignments get messed up.

This is definitely not computationally optimal because we are doing a lot of extra work; Bend's variables are immutable, so each time we move one element over, we have to copy the first vector or matrix. We're also moving each element to a different map O(log n) times instead of O(1) times if we just moved everything into one map by looping through the results. This was the best I could figure out under the restrictions of Bend, however.

Code for this approach is in `map.bend`.
### Quirk: _fold_ is a subset of _match_, but then why use fold?
The fold operation is syntactic sugar for match:
```python
fold t:
	case Tree/Node:
		return Tree/Node(t.left, t.right)
	case Tree/Leaf:
		return Tree/Leaf(t.value * 2)

#Same computation using match wrapped in a function
def doubleTree(t):
	match t:
		case Tree/Node:
			return Tree/Node(doubleTree(t.left), doubleTree(t.right))
		case Tree/Leaf:
			return Tree/Leaf(t.value * 2)
```
This also works if we pass arguments to fold, since functions can take arguments too. 

The issue with _fold_ is that it only works when the recursive calls only require themselves (and maybe some bookkeeping arguments). This means as soon as we want to use two structures simultaneously, as in my case with dot products, we have to revert to the match syntax.

I also think using _fold_ instead of _match_ is rather confusing in general, as the way _fold_ manages recursion is not obvious unless you've read and understood the Bend manual (I think _match_ is pretty intuitive in contrast). It seems like _fold_ saves a few keystrokes, but not much more. Using _fold_ feels similar to inlining functions in Python while simultaneously obfuscating their purpose.

It can be seen that _bend_ is also syntactic sugar for an if/else statement wrapped in a function (though _bend_ uses the _when_ _else_ syntax; I don't know if there's a difference.)
## Approach 3: No maps, custom trees
I actually tried this approach before the map one. 

We create a MatrixTree datatype with four variations: Leaf (a single value), Vector (a tree where each left and right subtree is either a vector or a leaf), Matrix (a tree where each left and right subtree is either a matrix or a vector), and Nil.

```python
type MatrixTree:
  Leaf { value } #Single value in a vector
  Vector {~left, ~right} #Vector of values divided in two
  Matrix {~topHalf, ~bottomHalf} #Matrix of vectors divided in two
  Nil
```

From here, our computations are very natural. To multiply two matrices, we need to split the first matrix in half until it's all rows, then multiply that row with the second matrix for which we split the same way. Once we're at the level of two vectors, we take the dot product by summing the dot products of their respective left and right sides.

Out of laziness, I made this approach work only good enough for matrices of size a power of 2, but I don't think it's hard to generalize it to any size with a couple more type matching cases.

Code for this approach is in `tree.bend`.
## Shortfall 3: In general, implementations must be tailored for Bend
While "if your code _can_ run in parallel, it _will_ run in parallel", it turns out that making sure your code _can_ run in parallel is not so easy. You will almost certainly have to write or redesign your data to work with Bend in a way that you yourself know will be highly parallelizable - in other words, Bend isn't magic.

This reduces the value proposition of Bend, at least for me, as I want to get my parallelism "for free" - I don't want to put in just as much work as I would have if I started in python and then added threads myself. Sure, I don't have to deal with _actual_ parallelization code, like mutexes and condition variables, but it's still quite a bit of wrangling to make Bend compute what I want in a way Bend can actually optimize.

One caveat is that we don't have to make _every_ operation parallel - in our case, we can choose to only parallelize the operation of initializing each dot product, and keep the dot products themselves as slow O(n) lists - bringing the real world computer into the picture, this is probably fine or even better than the fully parallelized alternative. In exchange we will get a somewhat simpler implementation. Intuitively, I would expect that as soon as we've parallelized enough to utilize all of the separate processing units on our computer or GPU, further parallelization isn't helpful - and this threshold can be reached pretty quickly.
### Shortfall 4: Too much matching
This is more of an annoyance: every time I want to use a variable, I have to first match its type before I can reference its contents. My code has tall towers of matches and cases when I have any kind of nesting in my types. This may be my fault for not using the _object_ syntax (Bend's version of structs) but from first looks at the docs, it doesn't seem that much better.

Philosophically, it seems like Bend should either be strongly typed, or not have this matching requirement. Instead we have what feels like an in-between state that is certainly not as ergonomic as Python, which does not care and just throws errors when variables aren't a compatible type.
## Speed test
To speed test the two implementations, I encoded the multiplication of two identity matrices. I'm sure more interesting matrices can be multiplied, but it's quite a bit of effort to encode a matrix in either of the two bend schemes. To factor out the time it takes to initialize the matrix, I allow each program to run the computation either once or twice, then subtract. Note that Bend can run in both single-threaded and multithreaded mode, using the run and run-c commands respectively.

I also wrote a naive python implementation which goes about the computation in a fairly standard dot-product-by-dot-product way, as well as a similar C implementation. I also threw in a numpy version.

All tests were run on a GCP instance with 8 cores and 60 GB of memory except the C one, which didn't compile right for GCP so I used my computer. I tried to run Bend's CUDA execution on the instance's T4, but unfortunately kept running into CUDA errors.

MT means multithreaded. Times are in seconds. We multiply two identity matrices of size 2^n by 2^n. First four result columns are Bend.


| n   | MT Map | Map | Tree | MT Tree | Py  | MT Py | C   | NP  |
| --- | ------ | --- | ---- | ------- | --- | ----- | --- | --- |
| 3   | .31    | .12 |      |         |     |       |     |     |
| 4   | 2.9    | 1.7 |      |         |     |       |     |     |
| 5   | 43     | 29  | .48  |         |     |       |     |     |
| 6   |        |     | 3.9  | 1.1     |     |       |     |     |
| 7   |        |     | 33   | 3.3     | .36 | .27   |     |     |
| 8   |        |     |      | 20      | 2.7 | 2.2   |     |     |
| 9   |        |     |      |         | 24  | 19    | .32 |     |
| 10  |        |     |      |         |     |       | 2.4 |     |
| 11  |        |     |      |         |     |       | 53  |     |
| 12  |        |     |      |         |     |       |     | .37 |
| 13  |        |     |      |         |     |       |     | 3.0 |
| 14  |        |     |      |         |     |       |     | 22  |

Some notes:
- I ran the C trials on my own computer, as the binary wasn't compatible.
- Some of the fast bend trials were extremely noisy, randomly taking longer than the next order; I'm not too interested in statistically sound results so I reran those ones.
- Sometimes the larger bend trials ran out of memory.
- Though I couldn't get Bend's CUDA version to work (not a fault of Bend), the docs report a 5x speedup while using CUDA over the regular multithreaded version - this would put the MT Tree on the same order as the Python program.

There's a lot of interesting data here. First, we find that multithreading the map implementation actually slows it down; this means the map implementation has a very high overhead for multithreading. It's also about two orders slower than the tree version; this I expected because the tree version has a lot fewer bookkeeping and overall unnecessary computations involved.

Multithreading the tree version boosts it by a little over one order, putting it about one order behind the naive python programs.  (One order here is about a factor of 8 in raw computation, since the algorithm we compute is O(x^3) for matrices of size x). The multithreaded Python program only has a slight boost over its normal counterpart. From there, the C and Numpy programs are 2 and 5 orders ahead respectively.
## Conclusion
I think Bend's dream is interesting and cool - our computers have lots of cores and threads, but we almost never write our programs in a way that utilizes them on the first pass. In theory, Bend automates all the heavy lifting of creating threads, mutexes, and so on. In practice, Bend requires a ton of logic finetuning just to make a program compatible with Bend's scheme of computation - and this is ignoring the current lack of raw performance, which I'm sure will improve rapidly over time. I'm interested to see how Bend progresses in development.