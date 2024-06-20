---
title: I tried Bend
description: I tried Bend
date: '2024-6-16'
categories:
  - Bend
  - Programming
published: true
---
I decided to try the new [Bend](https://github.com/HigherOrderCO/Bend) programming language.

Bend has two main goals:
1. In Bend, if your code can run in parallel, it will run in parallel
2. Bend is as easy to write as Python

This post is my attempt at a case study mixed in with my thoughts about the language.

Disclaimer: this post almost certainly has errors and misunderstandings about Bend. My background is as a university math/CS student with some functional programming knowledge.
## Quick background
Bend uses two keywords not common in mainstream languages: _fold_ and _bend_. The idea of _fold_ is to essentially do a Ctrl+F find and replace in a recursive data structure: if I wanted to replace all the leaf nodes (with values) in a tree with their doubles, I would write the following function:
```python
# This is the default type Tree
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
 When we have our Tree t, we treat it like a linked list where we "go to" its left and right nodes whenever it's not a leaf, and we double whenever we are at the leaf.
 
The unseen bit of logic here is that whenever we write t.left, or t.right, since those are defined to be recursive (as denoted by the ~ in the type definition), they are Trees themselves. Thus, the _fold_ folds back and runs the whole chunk of logic on that object too. The Leaf case terminates because value is not a recursive entry. 

This is essentially a BFS on the tree, where each branch can be computed in parallel, and opportunities for parallel computing like this are how Bend is able to multithread programs.

What we wrote is (mostly) equivalent to this C program:
```c
void doubleTree(Tree* t) {
	//no tree
	if !t return;
	
	//leaf
	if (!t->left && !t->right) {
		t->value *= 2;
		return;
	}
	
	//non leaf
	doubleTree(t->left);
	doubleTree(t->right);
}
```

The _bend_ operation is somewhat similar to _fold_, but it's used to build up a structure rather than operate on an existing one. The following _bend_ creates a tree of depth d:
```python
def makeTree(d):
	bend d:
		when d > 0:
			t = Tree/Node(fork(d-1), fork(d-1))
		else:
			t = Tree/Leaf(1)
	return t
```
Here, _fork_ is used to build another tree with a different argument to bend; each fork loops back to the beginning of bend. Fork is just an explicit version of the thing _fold_ does where it finds and recurses on the recursive arguments.
## Goal
I'm going to try to implement a function which multiplies two matrices. 
## Attempt 1: Lists
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
(Note: each List is either a List/Nil or a List/Cons, where List/Nil is an empty list and List/Cons is not. When our tail is empty, it will be a List/Nil, but until then it will be a LIst/Cons.)

This computation is sequential because if the entry-wise products were 1, 2, 3, 4, 5, 6, 7, we'd be computing 1+ (2+ (3+ (4+ (5+ (6 + 7))))), which must be computed in consecutive order. Bend has no way to optimize a computation like this, as each + depends on another + to complete first.

It seems like any computation involving lists will take O(n) time - for this reason, I struggle to think of a situation where the List datatype would ever be useful in a language like Bend, assuming A) it is not used simply as an O(1) sized tuple, and B) the programmer who chose Bend would like to take full advantage of Bend's main feature. I'll mention a caveat later.
## Attempt 2: Maps
Bend also has a map datatype. This map works similar to normal maps or dictionaries in other languages, and in theory can be used to simulate an indexable list which avoids the sequentiality of Lists.

The underlying structure of a Map is a bit complex; Maps represent the data as a binary tree where each node is either a Node or a Leaf. Leaves are just blank end caps in this case, and don't hold data. Each Node either does or doesn't contain a value, as well as a reference to left and right nodes. Nodes with no value contain a \* instead. 

This tree is designed such that every key (that we initialized the map with) corresponds with one node, where for each key k (in binary), the corresponding node is such that we step left for a 0 and right for a 1 when we read k from left to right (so 0 is the root node, 1 is the root's right, 2 is the root's left then right, etc.) Keys must either be or be similar to nonnegative integers.

For this approach, I directly use the map structure as a vector (so m\[i\] is the i'th index of the vector) and compute dot product recursively on the tree. The issue here is that while I can "match" the difference between a Leaf and a Node, I couldn't find a way to match the difference between a \* and an actual value, so I couldn't find a way to compute dot product recursively as v1.value \* v2.value + dot(v1.left, v2.left) + dot(v1.right, v2.right) without the \* valued nodes getting in the way.
## Attempt 3: Maps, merge-sort style
Alternatively, I can use the map indexing syntax. My function should take the dot product of the left half and right half of the first map with the left half and right half of the second map respectively.
```python
def dotProduct(v1, v2, l, r):
  if l == r:
    return v1[l] * v2[r]
  else:
    return dotProduct(v1, v2, l, (l+r)/2) + dotProduct(v1, v2, (l+r)/2+1, r)
```
This turns out to work, but it's a bit less efficient than approach 2 would have been - while approach 2 would traverse the tree just once, this approach has to fetch every element individually starting from the top - a slowdown of log n.

We also have to deal with merging our results. When we multiply two vectors, we end up with lots of single numbers that need to go in a new vector, but no straightforward way to merge them all together and keep the correct indexing.

The best (and only), but still problematic way I found to do this was to merge two vectors (and later, two matrices) by pushing one element of the second vector into the first vector, then recursing until the first vector has all of the second vector's elements. This requires that the second vector has nonstandard map indices starting at whatever the first vector ends at, or else indices will be messed up once the two vectors are mashed together.

This is definitely not computationally optimal because we are doing a ridiculous amount of extra work; Bend's variables are immutable, so each time we move one element over, we have to copy the first vector or matrix (this is probably optimized under the hood, like in Haskell). We're also moving each element to a different map O(log n) times instead of O(1) times if we just moved everything into one map by looping through the results. This was the best I could figure out under the restrictions of Bend, however.

Code for this approach is in `map.bend`.
### _fold_ is a subset of _match_; but why use fold?
Quick tangent: Bend has a _match_ keyword which takes a structure and does something with it based on what its type is. It turns out (as mentioned in the docs) that the fold operation is syntactic sugar for match:
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

The issue with _fold_ as a replacement of loops is that _fold_ only works when the recursive calls only require themselves (and maybe some bookkeeping arguments). As we want to use two structures simultaneously, as in my case with dot products, we have to revert to the match syntax.

I also think using _fold_ instead of _match_ is rather confusing in general, as the way _fold_ manages recursion is not obvious unless you've read and understood the Bend manual (I think _match_ is pretty intuitive in contrast).

It can be seen that _bend_ is also syntactic sugar for an if/else statement wrapped in a function (though _bend_ uses the _when_ _else_ syntax; I don't know if there's a difference.)
## Attempt 4: No maps, custom trees
Here, we trim the desire for baked-in indexability and use a barebones tree structure to represent matrices and vectors.

We create a MatrixTree datatype with four variations: Leaf (a single value), Vector (a tree where each left and right subtree is either a vector or a leaf), Matrix (a tree where each left and right subtree is either a matrix or a vector), and Nil.

```python
type MatrixTree:
	#Single value in a vector
	Leaf { value }
	#Vector of values divided in two
	Vector {~left, ~right}
	#Matrix of vectors divided in two
	Matrix {~topHalf, ~bottomHalf}
	Nil
```

From here, our computations are very natural. To multiply two matrices, we need to split the first matrix in half until it's all rows, then multiply each row with the second matrix which we split the same way. Once we've recursed down to the level of two vectors, we can take the dot product by summing the dot products of their respective left and right sides.

Out of laziness, I made this approach work only good enough for matrices of size a power of 2, but I don't think it's hard to generalize it to any size with a couple more type matching cases.

Code for this approach is in `tree.bend`.
## In general, implementations must be tailored for Bend
While "if your code _can_ run in parallel, it _will_ run in parallel", it turns out that making sure your code _can_ run in parallel is not so easy. You will almost certainly have to write or redesign your data to work with Bend in a way that you yourself know will be highly parallelizable - in other words, Bend isn't magic.

This reduces the value proposition of Bend, at least for me, as I want to get my parallelism "for free" - I don't want to put in on the order of the same amount of work as I would have if I started in python and then added threads myself. Sure, I don't have to deal with _actual_ parallelization code, like mutexes and condition variables, but it's still quite a bit of wrangling to make Bend compute what I want in a way Bend can actually optimize.

One caveat is that we don't have to make _every_ operation parallel - in our case, we can choose to only parallelize the operation of initializing each dot product, and keep the dot products themselves as slow O(n) lists - bringing the real world computer into the picture, this is probably fine or even better than the fully parallelized alternative. In exchange we will get a somewhat simpler implementation.

Intuitively, I would expect that as soon as we've parallelized enough to utilize all of the separate processing units on our computer or GPU, further parallelization isn't helpful - and this threshold can be reached pretty quickly.
## Too much matching
This is a bit of an annoyance I had: every time I want to use a variable, I have to first match its type before I can reference its contents. My code has tall towers of matches and cases when I have any kind of nesting in my types.

Philosophically, it seems like Bend should either be strongly typed, or not have this matching requirement. What we have is certainly not as ergonomic as Python, which does not care and just throws errors when variables aren't a compatible type.
## Speed test
To test the two implementations, I encoded the multiplication of two identity matrices. I'm sure more interesting matrices can be multiplied, but it's quite a bit of effort to encode a particular matrix in either of the two bend schemes. To factor out the time it takes to initialize the matrix, I allow each program to run the computation either once or twice, then subtract. Note that Bend can run in both single-threaded and multithreaded mode, using the run and run-c arguments respectively.

I also wrote a naive python implementation which goes about the computation in a fairly standard dot-product-by-dot-product way, as well as a similar C implementation. I had ChatGPT generate a multithreaded version of the python code (don't be surprised if it's not good code). Finally, I threw in a Numpy version.

All tests were run on a GCP instance with 8 cores and 60 GB of memory except the C one, which I ran on my computer because the binary wasn't compatible. I tried Bend's CUDA execution on the GCP instance's T4 GPU, but unfortunately kept running into CUDA errors I couldn't troubleshoot.

In the table, we multiply two identity matrices of size 2^n by 2^n. MT means multithreaded. Times are in seconds.  First four result columns are Bend.

| n   | MT Map | Map | Tree | MT Tree | Py  | MT Py | C   | Numpy |
| --- | ------ | --- | ---- | ------- | --- | ----- | --- | ----- |
| 3   | .31    | .12 |      |         |     |       |     |       |
| 4   | 2.9    | 1.7 |      |         |     |       |     |       |
| 5   | 43     | 29  | .48  |         |     |       |     |       |
| 6   |        |     | 3.9  | 1.1     |     |       |     |       |
| 7   |        |     | 33   | 3.3     | .36 | .27   |     |       |
| 8   |        |     |      | 20      | 2.7 | 2.2   |     |       |
| 9   |        |     |      |         | 24  | 19    | .32 |       |
| 10  |        |     |      |         |     |       | 2.4 |       |
| 11  |        |     |      |         |     |       | 53  |       |
| 12  |        |     |      |         |     |       |     | .37   |
| 13  |        |     |      |         |     |       |     | 3.0   |
| 14  |        |     |      |         |     |       |     | 22    |

Some notes:
- Some of the fast bend trials were extremely noisy, randomly taking longer than the next order of n; I'm not too interested in statistically sound results so I reran those ones.
- Sometimes the larger bend trials ran out of memory.
- Though I couldn't get Bend's CUDA version to work (not a fault of Bend), the docs report a 5x speedup while using CUDA over the regular multithreaded version - this would put the MT Tree on the same order as the (sequential) Python program. (Though this 5x speedup was computed on a small sub 1s timescale, and I'd expect CUDA to have high multithreading overhead.)

There's some interesting data here. First, we find that multithreading the map implementation actually slows it down, so it has a very high overhead for multithreading. It's also about two orders slower than the tree version; this I expected because the tree version has a lot fewer bookkeeping and overall unnecessary computations involved.

Multithreading the tree version boosts it by a little over one order, putting it about one order behind the naive python program.  (One order here is about a factor of 8 in raw computation, since the algorithm we compute is O(x^3) for matrices of size x). The multithreaded Python program only has a slight boost over its normal counterpart. From there, the C and Numpy programs are 2 and 5 orders ahead respectively (Numpy might take advantage of the identity-ness of the matrices.)

Anecdotally, I also think there's some role being played by memory and garbage collection; the first trial I run in Bend on a fresh restart seems less likely to hit OOM errors than later ones.
## Conclusion
I think what I kind of wanted from Bend going into this is the ability to look at a piece of code like:
```c 
int x = 0;
for (int i = 0; i < 100; i++) {
	x += i;
}
```
and for Bend to read this and (through some math-y functional programming magic) say "Oh look! Each iteration of the for loop doesn't actually depend on what happened in any of the other iterations. I can parallelize this." and compile/transpile/run something like
```c
void add_to_sum(int value, std::atomic<int>& result) {
    result += value;
}

atomic<int> x(0);
vector<thread> threads;

for (int i = 0; i < 100; i++) {
	threads.push_back(add_to_sum, i, ref(x));
}

for (auto& t : threads) {
	t.join();
}
```
(Under the assumption that addition is a really long and tedious computation. The relative ease of computing dot products is perhaps a major flaw in my case study, as it likely fails to play to Bend's strength.)

Instead of this, it feels like I myself have to spell it out for Bend in my implementation. It feels like I myself would be able to write an interpreter for Bend code that can be maximally multithreaded - just spawn new threads whenever I hit a match/fold/bend statement (it would be really hard and definitely above my pay grade, obviously, but the point is I can see how it might be done.) 

I think Bend's dream is interesting and cool - our computers have lots of cores and threads, but we almost never write our programs in a way that utilizes them on the first pass. In theory, Bend automates all the heavy lifting of creating threads, mutexes, and so on. In practice, Bend requires a ton of logic fine-tuning just to make a program compatible with Bend's scheme of computation - and this is ignoring the current lack of raw performance, which I'm sure will improve rapidly over time. I'm interested to see how Bend progresses in development.