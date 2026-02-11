---
title: I tried Anthropic's Performance Takehome

date: '2026-02-09'
  
published: true
---

<script>
  import { base } from '$app/paths';
  let images = [
    "01_first-shot-trace.png",
    "02_mux0-zoomed.png",
    "03_mux0-full-trace.png",
    "04_mux1-trace.png",
    "05_mux2-load-bubbles.png",
    "06_mux3-register-outage.png",
    "07_mux3-input-rotation.png",
    "08_preamble-before.png",
    "09_preamble-after.png",
    "10_alu-expanded.png",
    "11_tail-optimized.png"
  ]
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  // State
  let traceData = [];
  let maxCycle = 0;
  let currentCycle = 1;
  let isLoading = true;

  // Processed Data
  let instructionsByCycle = []; // Array<Array<Instruction>>
  let registerLiveness = new Map(); // Map<RegName, {start: int, end: int, type: string, raw: string}>
  let activeRegisters = [];
  let batchRoundTimeline = new Map(); // Map<batchNum, Array<{cycle, round}>>
  let allBatches = []; // sorted batch numbers (divided by 8)

  // Register Type Color Mapping (inline-style values so they override global CSS)
  // const and literal share the same "literal" color (amber/gold)
  const LITERAL_COLOR = { bg: '#92400e', text: '#fcd34d', border: '#d97706' };
  const TYPE_COLORS = {
    val: { bg: '#1e3a8a', text: '#bfdbfe', border: '#1d4ed8' },
    idx: { bg: '#064e3b', text: '#a7f3d0', border: '#047857' },
    tree: { bg: '#78350f', text: '#fde68a', border: '#b45309' },
    const: LITERAL_COLOR,
    mux: { bg: '#831843', text: '#fbcfe8', border: '#be185d' },
    hash: { bg: '#2e1065', text: '#ddd6fe', border: '#5b21b6' },
    mod: { bg: '#312e81', text: '#c7d2fe', border: '#4338ca' },
    mem: { bg: '#1f2937', text: '#d1d5db', border: '#4b5563' },
    default: { bg: '#111827', text: '#e5e7eb', border: '#374151' }
  };
  function pillStyle(type) {
    const c = TYPE_COLORS[type] || TYPE_COLORS.default;
    return `background-color: ${c.bg}; color: ${c.text}; border: 1px solid ${c.border};`;
  }
  function literalStyle() {
    return `color: ${LITERAL_COLOR.text};`;
  }

  onMount(async () => {
    try {
      const response = await fetch(`${base}/anthropic/trace.json`);
      const text = await response.text();
      // Perfetto traces often end with a trailing comma inside the list or partial writes
      // Simple fix for common trailing comma issues in generated JSON
      const cleanText = text.replace(/,\s*\]$/, ']'); 
      traceData = JSON.parse(cleanText);
      processTrace(traceData);
      isLoading = false;
      window.addEventListener('keydown', handleKeydown);
    } catch (e) {
      console.error("Failed to load or parse trace.json", e);
      isLoading = false;
    }

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  function processTrace(data) {
    const regMap = new Map();
    const instrs = [];
    let maxTs = 0;
    const batchProgressMap = new Map();

    // Regex to capture register pattern: type(args)
    // Matches: val(...), tree(...), tree_level_0(...), etc.
    const regRegex = /\b([a-z0-9_]+)\(([^)]+)\)/g;

    data.forEach(event => {
      // We only care about 'X' (Complete) events which represent ops
      if (event.ph !== 'X' || !event.args || !event.args.named) return;

      const cycle = event.ts;
      if (cycle > maxTs) maxTs = cycle;

      // Initialize cycle array if needed
      if (!instrs[cycle]) instrs[cycle] = [];

      // Add instruction (store tid for grouping scalar ALU 1-12)
      instrs[cycle].push({
        name: event.name,
        raw: event.args.named,
        cat: event.cat,
        tid: event.tid ?? -1
      });

      // Parse Registers from the instruction name (e.g. "B0: + idx(batch=0,round=0,normal)=const(TOP_NODE_INDEX),const(ZERO)")
      // event.args.named is a Python tuple like "('+', 192, 48, 160)" and does not contain register names
      const nameStr = event.name;
      regRegex.lastIndex = 0;
      let match;
      while ((match = regRegex.exec(nameStr)) !== null) {
        const rawReg = match[0];
        const typePrefix = match[1].split('_')[0]; // e.g., 'tree_mux' -> 'tree'
        
        // Determine type key for coloring
        let typeKey = 'default';
        if (['val', 'idx', 'tree', 'const', 'mux', 'hash', 'mod', 'mem'].includes(typePrefix)) {
          typeKey = typePrefix;
        } else if (match[1].startsWith('hash') || match[1].startsWith('mod')) {
           // catch hash_scratch, mod_scratch
           typeKey = typePrefix; 
        }

        if (!regMap.has(rawReg)) {
          regMap.set(rawReg, {
            id: rawReg,
            type: typeKey,
            start: cycle,
            end: cycle,
            shortName: formatShortName(rawReg, typeKey)
          });
        } else {
          const reg = regMap.get(rawReg);
          // Update liveness
          // If we see it again, extend the end cycle
          if (cycle > reg.end) reg.end = cycle;
          // Note: In SSA-ish IR, start is usually definition, but we trust the first appearance in trace
          if (cycle < reg.start) reg.start = cycle; 
        }
      }

      // Track batch progress from val(batch=X,round=Y,stage=0)
      const vpRegex = /val\(batch=(\d+),round=(\d+),stage=0\)/g;
      let vpm;
      while ((vpm = vpRegex.exec(nameStr)) !== null) {
        const batchNum = Math.floor(parseInt(vpm[1]) / 8);
        const roundNum = parseInt(vpm[2]);
        if (!batchProgressMap.has(batchNum)) batchProgressMap.set(batchNum, []);
        batchProgressMap.get(batchNum).push({ cycle, round: roundNum });
      }

      // Track batch stores — when val is stored, batch reaches round 16
      if (nameStr.includes('vstore')) {
        const storeRegex = /val\(batch=(\d+)/g;
        let sm;
        while ((sm = storeRegex.exec(nameStr)) !== null) {
          const batchNum = Math.floor(parseInt(sm[1]) / 8);
          if (!batchProgressMap.has(batchNum)) batchProgressMap.set(batchNum, []);
          batchProgressMap.get(batchNum).push({ cycle, round: 16 });
        }
      }
    });

    // Build batch progress timelines (sort by cycle for binary-search-like lookups)
    for (const [, events] of batchProgressMap.entries()) {
      events.sort((a, b) => a.cycle - b.cycle);
    }
    batchRoundTimeline = batchProgressMap;
    allBatches = [...batchProgressMap.keys()].sort((a, b) => a - b);

    instructionsByCycle = instrs;
    maxCycle = maxTs;
    registerLiveness = regMap;
    updateActiveRegisters();
  }

  function formatShortName(raw, type) {
    // condense the display string for the badges
    return raw
      .replace(/batch=(\d+)/g, (_, n) => `b${Math.floor(parseInt(n) / 8)}`)
      .replace('round=', 'r')
      .replace('stage=', 's')
      .replace('slots=', 'sz')
      .replace('level=', 'L')
      .replace('node=', 'n')
      .replace('part=', 'p')
      .replace('idx=', 'i')
      .replace(/\s/g, '');
  }

  // Get register type key for coloring (same logic as processTrace)
  function getRegisterType(rawReg) {
    const match = rawReg.match(/^([a-z0-9_]+)\(/);
    if (!match) return 'default';
    const typePrefix = match[1].split('_')[0];
    if (['val', 'idx', 'tree', 'const', 'mux', 'hash', 'mod', 'mem'].includes(typePrefix)) return typePrefix;
    if (match[1].startsWith('hash') || match[1].startsWith('mod')) return typePrefix;
    return 'default';
  }

  // Regex for register pattern (type(args))
  const REG_REGEX = /\b([a-z0-9_]+)\(([^)]+)\)/g;
  function getOrderedRegs(str) {
    const regs = [];
    REG_REGEX.lastIndex = 0;
    let m;
    while ((m = REG_REGEX.exec(str)) !== null) regs.push(m[0]);
    return regs;
  }

  // Parse instruction name into structured lines for display (dest =, src1, op, src2, etc.)
  function parseInstruction(name) {
    const batchMatch = name.match(/^B(\d+):\s*(.*)$/);
    const batchPrefix = batchMatch ? `B${Math.floor(parseInt(batchMatch[1]) / 8)}` : null;
    const rest = batchMatch ? batchMatch[2] : name;

    const regs = getOrderedRegs(rest);

    // No operands
    if (rest === 'pause' || rest === 'init') {
      return { batchPrefix, op: rest, lines: [{ textOnly: rest }] };
    }

    // Assignment form: something ← right
    if (rest.includes('←')) {
      const [left, right] = rest.split('←').map(s => s.trim());
      // const dest←literal
      if (/^\d+$/.test(right)) {
        return { batchPrefix, op: 'const', lines: [{ reg: regs[0], symbol: '←' }, { literal: right }] };
      }
      // vstore mem[addr]←src
      if (left.startsWith('vstore ')) {
        return { batchPrefix, op: 'vstore', lines: [{ prefix: 'mem[', reg: regs[0], suffix: ']', symbol: '←' }, { reg: regs[1] }] };
      }
      // vload dest←mem[addr] or load_offset dest+off←mem[addr+off]
      if (right.startsWith('mem[')) {
        const closeBracket = right.indexOf(']');
        const addrPart = right.slice(4, closeBracket);
        const addrReg = regs[1];
        const afterAddrInBracket = addrPart.slice(addrReg.length); // e.g. "+0" or ""
        const suffix = afterAddrInBracket + ']';
        return { batchPrefix, op: left.split(/\s+/)[0], lines: [{ reg: regs[0], symbol: '←' }, { prefix: 'mem[', reg: regs[1], suffix }] };
      }
      // Unary: dest←src (e.g. vbroadcast)
      return { batchPrefix, op: left.split(/\s+/)[0], lines: [{ reg: regs[0], symbol: '←' }, { reg: regs[1] }] };
    }

    // Equality form: op dest=...
    const opMatch = rest.match(/^(\S+)\s+/);
    const op = opMatch ? opMatch[1] : '';
    if (op === 'vmultiply_add') {
      return { batchPrefix, op, lines: [
        { reg: regs[0], symbol: '=' },
        { reg: regs[1], symbol: '*' },
        { reg: regs[2], symbol: '+' },
        { reg: regs[3] }
      ] };
    }
    if (op === 'vselect') {
      return { batchPrefix, op, lines: [
        { reg: regs[0], symbol: '=' },
        { reg: regs[1], symbol: '?' },
        { reg: regs[2], symbol: ':' },
        { reg: regs[3] }
      ] };
    }
    // Binary: op dest=src1,src2
    return { batchPrefix, op, lines: [
      { reg: regs[0], symbol: '=' },
      { reg: regs[1] },
      { symbol: op },
      { reg: regs[2] }
    ] };
  }

  function updateActiveRegisters() {
    if (!registerLiveness.size) return;
    
    // Filter registers alive at currentCycle
    // We add a small grace period (+1) so they don't disappear instantly after use
    // to make the animation smoother
    const active = [];
    for (const reg of registerLiveness.values()) {
      if (reg.start <= currentCycle && reg.end >= currentCycle) {
        active.push(reg);
      }
    }
    // Sort by type then by name for consistent grouping
    active.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.id.localeCompare(b.id);
    });
    activeRegisters = active;
  }

  function computeBatchProgress(cycle) {
    const result = new Map();
    // All known batches default to round 0
    for (const batch of allBatches) {
      result.set(batch, 0);
    }
    for (const [batch, timeline] of batchRoundTimeline.entries()) {
      let maxRound = 0;
      for (const entry of timeline) {
        if (entry.cycle <= cycle) {
          if (entry.round > maxRound) maxRound = entry.round;
        } else break;
      }
      result.set(batch, maxRound);
    }
    return result;
  }

  // Playback Controls
  function stepBy(n) {
    currentCycle = Math.max(0, Math.min(maxCycle, currentCycle + n));
    updateActiveRegisters();
  }

  function seek(e) {
    currentCycle = +e.target.value;
    updateActiveRegisters();
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowRight') stepBy(1);
    if (e.key === 'ArrowLeft') stepBy(-1);
  }

  // Group instructions by execution unit type
  function buildDisplayInstructions(cycleInstrs) {
    if (!cycleInstrs || cycleInstrs.length === 0) return { aluValu: [], load: [], store: [], vselect: [] };
    const groups = { aluValu: [], load: [], store: [], vselect: [] };
    const seenAlu = new Set();
    for (const instr of cycleInstrs) {
      const tid = instr.tid ?? -1;
      const name = instr.name;
      if (name.includes('vselect')) {
        groups.vselect.push(instr);
      } else if (tid >= 19 && tid <= 20) {
        groups.load.push(instr);
      } else if (tid >= 21 && tid <= 22) {
        groups.store.push(instr);
      } else {
        // Deduplicate identical scalar ALU ops (tid 1-12)
        if (tid >= 1 && tid <= 12) {
          if (seenAlu.has(name)) continue;
          seenAlu.add(name);
        }
        groups.aluValu.push(instr);
      }
    }
    return groups;
  }

  // Reactive updates
  $: rawCycleInstrs = instructionsByCycle[currentCycle] || [];
  $: currentInstructions = buildDisplayInstructions(rawCycleInstrs);
  $: progressPercent = (currentCycle / maxCycle) * 100;
  $: currentBatchProgress = computeBatchProgress(currentCycle);
  
</script>


I attempted [Anthropic's performance take-home exam](https://github.com/anthropics/original_performance_takehome) released recently. I achieved a final score of 1218 cycles, beating both the recruiting threshold (1487) and Opus 4.5's best score (1363). [My solution](https://github.com/SambhavG/anthropic-performance) is relatively simple and interpretable, combining a couple of basic theoretical and practical optimizations. Scroll to the bottom for a simulation of the solution in the form of my intermediate representation.

# Problem statement

## The Processor
You're given a single instruction multiple data (SIMD) processor simulator. This processor can perform math operations on vectors of length 8.

The processor can perform up to 12 scalar ALU operations, 6 vectorized ALU operations, 2 loads, 2 stores, and a flow control operation all in one clock cycle, but no two instructions in the same cycle can read what the other writes.

There's a RAM "scratch memory" of 1536 ordered registers, which is what the ALU and vector instructions can operate on. Vector instructions have to target 8 contiguous scalar registers. All the actual problem data starts on main memory, and must be loaded into scratch memory before it can be used.

## The Algorithm
The algorithm you're asked to compute is as follows: you're given a binary tree of height 10 (so the layers have 1, 2, 4, ..., 2^10 nodes each, for 11 distinct layers and 2047 nodes total). Each node has a random integer value. You're also given an array of input values, which has length batch_size=256. For each input value, you start at the top of the tree and xor your value with the top node's value, then hash this new value with a given hash function. If your result is even, you take the left branch of the tree, otherwise you go right. You repeat this operation 16 times total, each time going down a level of the tree, and eventually looping around to the top node of the tree when you get to the last layer (which will always happen after round 11). This traversal is completely independent for each of the 256 input values.

For the tree, we can compute child values using the tree indexing trick where the top node is at index 1 and every node x's child is at index 2x and 2x+1 for left and right. Given this, there are three distinct phases to each of the 16 hops, given a current value v and index i (initialized to 1):
1. Get the corresponding tree node i's value v' and xor it: v = v xor v'
2. Hash v: v = hash(v)
3. Compute the next index: i = 2i + (v%2), and if i>2047, i = 1

Notably, we'll know at compile time when the loopback happens since we can compile our kernel for a specific testcase (where only the inner tree data is random but all the size parameters are fixed and known), so we don't actually have to check this if statement in code (we can just directly set all the indices back to 1).

# Compute and Memory Bounds

## Ops
The baseline code requires 147734 total instructions to compute the algorithm on the given test case. The baseline code only uses singular ALU ops and no SIMD/vectorization at all in any clock cycle. We're only tested on this one specific test case, namely 256 inputs, height 10 tree, and 16 rounds, so we can overfit for convenience in this analysis.

The processor is capable of roughly 8x6+12 = 60 regular arithmetic operations per clock cycle, assuming that we always fuse vectorized multiplies and adds into a multiply_add.

The initial xor with the value in the tree takes 1 op. The hash function mentioned earlier has 6 stages, each requiring 3 operations, and we have to do an additional xor at the beginning. However, it turns out the multiply_add can be used to crush three of those stages down to one operation each (these stages can be written as the sum of x, x shifted left by some amount, and a hardcoded number, which boils down to x times 2^n+1 plus c for some n and c), so we only need 12 ops for our hash. Computing the next node to hop to is a bit trickier and implementation-dependent, but we'll assume for now it requires an & with 1 for the modulo check, a doubling of the old index pointer, and an addition of that 0 or 1 from the modulo check, so three more ALU ops. This is a total of 16 operations per batch item per round.

Then for a batch size of 256 and 16 rounds, we'll need 256x16x16=65536 operations, or roughly 1092 clock cycles for compute. Note that we're allowed to load and store at the same time as our compute cycles, so this is a lower bound on performance possible assuming we compute exactly as described. Opus 4.5's launch performance was 1487 cycles, and its best performance was 1363 cycles.

### Aside: Main Memory Indexing
The tree values in main memory start at address 7, meaning the first node is at main_mem\[7\].  We can only address main memory by putting the address we want in a scratch register and giving that scratch register as an argument. This means if we store indices with our regular 1-indexing, we'll have to add 6 every time we want to fetch the tree values, and subtract 6 every time we want to compute the next index. We really want to avoid these extra ALU operations if possible.

It turns out we can keep our indices in the 7-indexed scheme thanks to the vmultiply_add operation. Normally, we'd compute left_node = parent_node x 2, but if we instead store parent_node+6, we can compute left_node+6 = (parent_node+6) x 2 - 6. This means we can directly load from our index registers while still cheaply doubling node indices.

## Memory 
I initially wrote up a version of this problem where we try to load in as much of the tree as possible to scratch, then use those values throughout the problem. For the same reason earlier mentioned about main memory addressing, this is impossible - there are no instructions capable of double indirection into scratch memory. If we have a scratch address in a scratch register, we can't actually dereference that scratch address and fetch or do math with the result. This means, for every round and value, we need to either:
1. Fetch the required tree value straight from main memory, as the load instruction does allow (and in fact requires) double indirection.
2. Do something clever using instructions like vectorized select to reduce the memory pressure, particularly on less complicated levels of the tree. For example, on level 0, all of the scratch values xor with the same tree value, so we can just load it to a register and reuse it for all the scratch values without any loading logic.

If we go with idea 1 for every level of our tree, we'll need 16 rounds of loads for each of the 256 values in our batch, and at 2 loads per cycle that's at least 2048 cycles. Thanks to the specific test case design and the VSELECT instruction, there's a lot we can do to match the memory and compute cost.

### Muxing
(For this section, we'll go back to assuming our indices are 1-indexed)

We want to replace memory operations with compute operations to balance out the workloads. On layer 0, as mentioned, we'll just load the first tree value once and use it for every element.

On layers 1, 2, and 3, we need to load in only 2, 4, and 8 values respectively (unlike layer 10 where there's as many as 1024 possible values we could be asked to load in, with likely little to no reuse among our 256 elements). To take advantage of these small layers, we can implement a MUX (multiplexing) tree, which attempts to efficiently convert the vector of indices \[a,b,c,d,e,f,g,h\] to a vector of \[arr\[a\],arr\[b\],arr\[c\],arr\[d\],arr\[e\],arr\[f\],arr\[g\],arr\[h\]] by taking advantage of assumptions on the range of the values of the indices.

For this, we'll need the VSELECT instruction. VSELECT takes three vector registers we can call s, a, and b. VSELECT functions like an if-else statement on the condition of s. If index i of s is nonzero, the output register gets a\[i\] in slot i, otherwise it gets b\[i\].

In the 2-value case, the mux tree is pretty easy. All our indices are either 2 or 3, so we & our index vector with 1 to get a vector of 0 or 1 based on if we need to xor that value with tree\[2\] (even) or tree\[3\] (odd). Now we set our output vector to the VSELECT of the vector of tree\[2\] and the vector of tree\[3\,] selecting on our &1 vector so that the even values (where there's a 0) will get index 2 and the odd values will get index 3. Note that we broadcast our two tree values into full vector registers so that they are in the form required by the VSELECT instruction.

In the 4-value case, we start building up the MUX tree. The idea is that we can VSELECT the bottom bit for each case of the top bit, then VSELECT those two cases together. We're working with indices 4, 5, 6, and 7, with bottom bits 0b00, 0b01, 0b10, 0b11. First we VSELECT together tree\[4\] and tree\[5\] based on the bottom bits (so selecting via &1) - this puts the correct value in place for 0b00 and 0b01, but garbage value in place for 0b10, 0b11. Next, we VSELECT together tree\[6\] and tree\[7\] on the bottom bits into a separate register, which gives us the right values for 0b10 and 0b11 and garbage for the others. Finally, we &2 the indices to get the top bit, which tells VSELECT which register that index should pull its value from (while the other register will have a garbage value). This combines our two intermediate vectors into one final correct vector.

We can build this tree up arbitrarily tall, but it will obviously cost more registers and compute if we do it later and later in the tree since we'll have more and more values to mux together. Since there are 32 batches of 8 in our input, we'll need 0, 32, 96, 224, and 480 VSELECTs for each round at level 0, 1, 2, 3, and 4 in the tree (and each of these levels appears twice). We only have on the order of 1000 total VSELECTS we can use since we only get one per cycle.

If we load all but levels 0-3 of the tree, we will load 8 levels of the tree and require 2048 loads, taking 1024 cycles. This will require 704 VSELECTs and a handful more vector ops, so resource consumption across the instruction types is now much more balanced.

# Symbolic Intermediate Representation
We could try to orchestrate and fit the instructions to the CPU ourselves, but most likely this will create gaps that are difficult to manually handle. Instead, we're going to write our code in an intermediate representation (a version of the program that operates on symbolic registers rather than real data or real scratch addresses), and then write a compiler pass that compresses and pipelines it automatically. This will also make it easier to take advantage of ALU operations later.

The intermediate representation scheme we'll write is relatively simple, but hits some quirks around loading and storing. It has two rough assumptions:
1. All registers are treated as 8-aligned vector registers
2. Every instruction writes to a fresh register. The compiler will handle checking when a register can be "clobbered" ie written over due to nothing needing to read from it anymore.

One exception is that loading the tree from indices requires 8 loads all to the same vector, because it only loads one scalar at a time, so the compiler will have to do some extra offset computations when lowering this instruction from IR to a real instruction.

With this and a bunch of small implementation details, we can write our entire computation in an IR form that doesn't care what the input values are, as long as we're careful to write each instruction correctly. A sample of these is shown below:

```python
@dataclass(frozen=True)
class const_register:
    name: str
    is_scalar: bool


@dataclass(frozen=True)
class index_register:
    batch_index: int
    round: int
    is_doubled: bool

@dataclass(frozen=True)
class value_register:
    batch_index: int
    round: int
    stage: int

@dataclass(frozen=True)
class tree_address_register:
    batch_index: int
    round: int

@dataclass(frozen=True)
class tree_register:
    batch_index: int
    round: int
    slots_filled: int
```

Each IR instruction is a real operation, but written to operate on instantiations of these imaginary registers instead of a real scratch address. For example, when computing the first hash stage of a value, inside a double for loop that tells us which batch index and round we're on:
```python
# Hash stage 1
instrs.append((
	"valu",
	"vmultiply_add",
	value_register(batch_index=,round=,stage=2),
	value_register(batch_index=,round=,stage=1),
	const_register(name="HASH_1_MUL", is_scalar=False),
	const_register(name="HASH_1_ADD", is_scalar=False),
))
```
The fresh register property mentioned earlier gives this IR code the really nice property that once we've emitted all our instructions, we can verify that they perform the correct computation by simulating the instructions on an infinite register machine that always allocates a fresh register on each write.
# Compiling
We'd now like our compiler to figure out how to pack our instructions into the given slots for us. With our IR, the first pass of this is pretty easy. We need to know which instructions depend on which so that each instruction that reads from scratch always has its desired inputs available. Any two instructions that have all their inputs available can be immediately scheduled.

We can generate a dependency graph from our instructions, where we say A depends on B (B->A) if B writes a register that A reads. Once we've constructed this dependency graph, we can greedily grab sets of orphaned nodes from the graph (nodes with no parents, meaning all the registers are ready to use) and append them to the current cycle until we're out of instructions or out of slots in the cycle. We can keep track of scratch registers at the same time, where any register that no longer has future readers will be evicted from the used scratch.

# First Shot (2107 cycles)
We'll skip the mux tree for now and check that our compiler works from end to end. 

As we expect, we're underutilizing the vector ALU because of loads - almost exactly to the degree we expect, 2048 load cycles + extra overhead like loading constants and final stores.

<img src="{base}/anthropic/{images[0]}" alt="First shot trace" style="margin: 1em 0em">

# "Mux" Level 0 (1860 cycles)
We'll now directly address level 0's one node as a constant. Now all six VALU lanes are fully utilized for the first ~200 cycles and again later on (once we've looped back around to level 0) for another 200 cycles.

Those 200 cycles, zoomed in:
<img src="{base}/anthropic/{images[1]}" alt="Mux 0 zoomed" style="margin: 1em 0em">

The entire trace, with the second set of 200 cycles highlighted:
<img src="{base}/anthropic/{images[2]}" alt="Mux 0 full trace" style="margin: 1em 0em">

# Mux Level 1 (1722 cycles)
Because of our indexing optimization, we have to be a little careful how we mux, but thankfully just by shuffling the two outputs in each VSELECT we can assign the mux outputs however we want (as long as the input index range is contiguous, so that their bottom bits uniquely define them).

<img src="{base}/anthropic/{images[3]}" alt="Mux 1 trace" style="margin: 1em 0em">

# Mux Level 2 (1655 cycles)
The speedups are starting to stall, likely because our compiler isn't smart enough to rush through one of the batches so it can get to the load-heavy batches and start running the load bottleneck. We have load bubbles of roughly 300 cycles.

<img src="{base}/anthropic/{images[4]}" alt="Mux 2 load bubbles" style="margin: 1em 0em">

# Mux Level 3 (1620 cycles, but out of registers)
In addition to adding mux level 3, I went back and optimized the logic for mux 1 and 2 (mainly reusing the value&1 computed in the previous iteration). Not only are we losing our speedups, we also can't actually run the code without at least 1900 registers. 

This is mainly because of bigger and bigger bubbles in loading; our compiler isn't smart enough to rush to the bounded loading steps. We're running out of registers because our compiler schedules all the heavy mux level 3 operations at once among all the batches, and they consume a lot of extra registers before they can be freed.

<img src="{base}/anthropic/{images[5]}" alt="Mux 3 register outage" style="margin: 1em 0em">

# Mux Level 3, Rotated Input (1548 cycles)
We can sidestep this problem really simply - we just need to write our input in a way that doesn't clog up the registers when everyone gets to muxing level 3. We do this by emitting instructions for all rounds of batch 1, then all rounds of batch 2, etc. instead of all round 1s, all round 2s, etc. By doing this, not only do we no longer run out of registers, but we also smear the computation much more evenly through the middle - the big bubble in the fifth and sixth lane is completely gone.

This is not a scientific result, but a fairly lucky coincidence that manages to spread out the mux level 3 enough to keep our registers open. It saves us a lot of time redesigning the compiler.

The coloring changed because I updated the labeling to use the names of the IR registers instead of the true underlying register indices.

<img src="{base}/anthropic/{images[6]}" alt="Mux 3 input rotation" style="margin: 1em 0em">

# Optimize Preamble (1498 cycles)
Right now we load_const all our constants, which clogs up the preamble quite a bit with a stuffed load unit. A good chunk of our constants can be computed directly from other constants, like HASH_6_RIGHTSHIFT with the value 16 that can be computed as 4x4. 

We can also start using the ALU earlier. Our code doesn't do hotpath analysis, so it takes a bit of loading before the ALU can start crunching. Just by moving the loading of tree node 0 a little earlier, we can start the ALU much sooner and overlap it with the last few loads needed for later stages.

Before:
<img src="{base}/anthropic/{images[7]}" alt="Preamble before" style="margin: 1em 0em">

After:
<img src="{base}/anthropic/{images[8]}" alt="Preamble after" style="margin: 1em 0em">

# Use the rest of the ALU (1240 cycles)
We have 12 ALU operations unused. The first 8 are easy to use - any vector ALU op that isn't a broadcast operation or vmultiply_add operation can be split into 8 of the same scalar operation with the register indices updated.

For the last 4 slots, we have to be a little smarter. We can schedule half of a vector instruction by turning the first 4 slots into ALU ops, but leave it on the graph and mark it as half done instead of fully done. We'll prioritize scheduling the other half of these vector instructions on the next cycle's ALU so that the vector is half-done for only one cycle.

This predictably gives us a huge performance jump, as we go from 6 to 7.5 vector ALU ops per cycle. Naively, this should give us at most a 25% performance increase, which would ideally put us at ~1200 cycles, but obviously there's some non-ALU overhead. This also puts us ahead of Claude's best performance.

<img src="{base}/anthropic/{images[9]}" alt="ALU expanded" style="margin: 1em 0em">

# Optimize Tail (1218 cycles)
While the aforementioned input rotation is great for fixing the register problem, it creates a long tail of inputs that poorly utilize the compute at the end, as there aren't enough batch elements to parallelize (manifesting as a staircase pattern). We can slightly improve on this by adding the last four batches in the original order, round-by-round, so that there will be more parallel work at any given moment near the end.

We again get lucky with no register outage, likely thanks to (1) the previous batches creating a long tail for our instructions to fill in which smears the extra VSELECT registers, and (2) the new batches we scheduled not being large enough to exert too much register pressure. We pick the last four batches because they achieve the best performance.

<img src="{base}/anthropic/{images[10]}" alt="Tail optimized" style="margin: 1em 0em">

# Final thoughts
There's quite a lot more compiler optimization work here that could be done, but given I'm approaching my own theoretical lower bound, I think these returns will be quickly diminishing. These efforts would mainly go towards trying to solve for the best packing, through things like hot path analysis to avoid the remaining tail at the end and smarter register allocation. We do some manual shuffling of instructions in the preamble that we'd really prefer the compiler figure out for us, and we would rather our compiler be agnostic to the rotation and exact instruction stream order of the IR.

There's about 80 cycles of load bubbles left, which if further optimized would get us within a few percent of the ALU lower bound mentioned earlier. Under the current compute graph this may not be possible with limited remaining ALU room, but there's plenty of other inefficiencies in the loading operations (namely in loading addresses for main memory) I didn't work on because it would've required significant updates to the IR scheme.

I achieved a final score of 1218 cycles, which I'm pretty happy with. I ran it on the commented-out test case on different args to show we didn't overfit to the main test case and actually get even better relative speedups on smaller test cases:

```python
forest_height=2, rounds=4, batch_size=128
CYCLES:  156
Speedup over baseline:  947.0128205128206
forest_height=3, rounds=5, batch_size=128
CYCLES:  233
Speedup over baseline:  634.0515021459228
forest_height=4, rounds=6, batch_size=128
CYCLES:  251
Speedup over baseline:  588.5816733067729
forest_height=2, rounds=4, batch_size=256
CYCLES:  284
Speedup over baseline:  520.1901408450705
forest_height=3, rounds=5, batch_size=256
CYCLES:  419
Speedup over baseline:  352.5871121718377
forest_height=4, rounds=6, batch_size=256
CYCLES:  462
Speedup over baseline:  319.7705627705628
forest_height=10, rounds=16, batch_size=256
CYCLES:  1218
Speedup over baseline:  121.29228243021346
forest_height=10, rounds=16, batch_size=256
CYCLES:  1218
Speedup over baseline:  121.29228243021346
```

Below is a simulator that shows the entire computation being performed in my IR cycle-by-cycle.

<div class="trace-viewer font-mono bg-gray-950 text-gray-200 p-4 rounded-lg border border-gray-800 shadow-2xl h-[800px] flex flex-col">
  
  <div class="header mb-4 border-b border-gray-800 pb-4">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-xl font-bold text-gray-100 flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
        IR Processor Trace
      </h2>
    </div>

    <div style="position: relative; width: 100%; height: 1.25rem; border-radius: 9999px; margin-bottom: 0.75rem; cursor: pointer; background: #1e293b;">
      <div style="position: absolute; top: 0; left: 0; height: 100%; border-radius: 9999px; transition: width 75ms; width: {progressPercent}%; background: #2563eb;"></div>
      <div style="position: absolute; top: 50%; transform: translateY(-50%); width: 1rem; height: 1rem; border-radius: 9999px; background: white; left: calc({progressPercent}% - 8px); box-shadow: 0 0 10px rgba(37,99,235,0.8);"></div>
      <input 
        type="range" 
        min="0" 
        max={maxCycle} 
        value={currentCycle} 
        on:input={seek}
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; margin: 0;"
      />
    </div>

    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; align-items: stretch;">
      <button on:click={() => stepBy(-100)} class="btn" disabled={currentCycle <= 0}>&lsaquo;&lsaquo;&lsaquo;</button>
      <button on:click={() => stepBy(-10)} class="btn" disabled={currentCycle <= 0}>&lsaquo;&lsaquo;</button>
      <button on:click={() => stepBy(-1)} class="btn" disabled={currentCycle <= 0}>&lsaquo;</button>
      <div style="display: flex; align-items: center; justify-content: center; text-align: center;">
        <span class="text-white font-bold text-sm">{currentCycle}</span><span class="text-gray-500 text-sm ml-1">/ {maxCycle}</span>
      </div>
      <button on:click={() => stepBy(1)} class="btn" disabled={currentCycle >= maxCycle}>&rsaquo;</button>
      <button on:click={() => stepBy(10)} class="btn" disabled={currentCycle >= maxCycle}>&rsaquo;&rsaquo;</button>
      <button on:click={() => stepBy(100)} class="btn" disabled={currentCycle >= maxCycle}>&rsaquo;&rsaquo;&rsaquo;</button>
    </div>
  </div>

  <div class="flex-1 grid grid-cols-12 gap-6 min-h-0">
    
    <div class="col-span-4 flex flex-col min-h-0 border-r border-gray-800 pr-4">
      <!-- Batch Progress -->
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Batch Progress</h3>
      <div class="bg-gray-900/50 rounded-lg p-2 mb-3 border border-gray-800" style="flex-shrink: 0;">
        <svg viewBox="0 0 200 100" width="100%" style="display: block;" preserveAspectRatio="xMinYMin meet">
          {#each [0, 4, 8, 12, 16] as tick}
            <text x={16 + (tick / 16) * 180} y="3.5" fill="#4b5563" font-size="3" font-family="monospace" text-anchor="middle">{tick}</text>
          {/each}
          {#each allBatches as batch, i}
            {@const y = 7 + i * 2.9}
            {@const progress = currentBatchProgress.get(batch) ?? 0}
            {@const x = 16 + (progress / 16) * 180}
            <text x="0" y={y + 1} fill="#6b7280" font-size="2.8" font-family="monospace">{batch}</text>
            <line x1="16" y1={y} x2="196" y2={y} stroke="#374151" stroke-width="0.4" />
            <circle cx={x} cy={y} r="1.4" fill="#3b82f6" />
          {/each}
        </svg>
      </div>

      <!-- Instructions Executing -->
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Instructions Executing</h3>
      <div class="overflow-y-auto pr-2 custom-scrollbar flex-1">
        {#if currentInstructions.aluValu.length === 0 && currentInstructions.load.length === 0 && currentInstructions.store.length === 0 && currentInstructions.vselect.length === 0}
          <div class="text-gray-600 italic text-sm py-4 text-center">No instructions (Bubble/Pause)</div>
        {/if}
        {#each [{ key: 'aluValu', label: 'ALU / VALU' }, { key: 'load', label: 'LOAD' }, { key: 'store', label: 'STORE' }, { key: 'vselect', label: 'VSELECT' }] as group}
          {#if currentInstructions[group.key].length > 0}
            <div style="color: #6b7280; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 0 2px; margin-top: 4px;">{group.label}</div>
            {#each currentInstructions[group.key] as instr, i (group.key + '-' + String(i))}
              {@const parsed = parseInstruction(instr.name)}
              <div
                in:fly={{ x: -20, duration: 200 }}
                class="instr-box"
                style="background-color: #1f2937; border: 1px solid #4b5563; border-radius: 6px; padding: 3px 8px; margin-bottom: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.3); white-space: nowrap; overflow: hidden; display: flex; align-items: center; gap: 4px; font-size: 11px;"
              >
                {#if parsed.batchPrefix}
                  <span style="color: #60a5fa; font-weight: 700; flex-shrink: 0;">{parsed.batchPrefix}</span>
                {/if}
                {#each parsed.lines as line}
                  {#if line.textOnly}<span style="color: #6b7280;">{line.textOnly}</span>{:else}{#if line.prefix}<span style="color: #6b7280;">{line.prefix}</span>{/if}{#if line.reg}{@const regType = getRegisterType(line.reg)}<span class="reg-pill" style="{pillStyle(regType)}; padding: 1px 5px; border-radius: 9999px; font-weight: 500; font-size: 10px;" title={line.reg}>{formatShortName(line.reg, regType)}</span>{/if}{#if line.suffix}<span style="color: #6b7280;">{line.suffix}</span>{/if}{#if line.symbol}<span style="color: #9ca3af;" class="select-none">{line.symbol}</span>{/if}{#if line.literal !== undefined}<span style="{literalStyle()}">{line.literal}</span>{/if}{/if}
                {/each}
              </div>
            {/each}
          {/if}
        {/each}
      </div>
    </div>

    <div class="col-span-8 flex flex-col min-h-0">
      <div class="flex justify-between items-end mb-20px">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Registers ({activeRegisters.length})</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 10px; margin-bottom:6px;">
          {#each Object.entries(TYPE_COLORS) as [key, _]}
            {#if key !== 'default'}
              <span class="reg-pill" style="{pillStyle(key)}; padding: 2px 6px; border-radius: 9999px; display: inline-block;">
                {key}
              </span>
            {/if}
          {/each}
        </div>
      </div>
      
      <div class="bg-gray-900/50 rounded-lg p-4 flex-1 overflow-y-auto custom-scrollbar border border-gray-800 shadow-inner">
        {#if isLoading}
          <div class="flex items-center justify-center h-full text-blue-400 animate-pulse">Loading Trace Data...</div>
        {:else if activeRegisters.length === 0}
           <div class="flex items-center justify-center h-full text-gray-600">No active registers</div>
        {:else}
          <div style="display: flex; flex-wrap: wrap; align-content: flex-start; gap: 8px;">
            {#each activeRegisters as reg (reg.id)}
              <span
                animate:flip={{ duration: 300 }}
                in:fly={{ y: 10, duration: 200 }}
                out:fade={{ duration: 200 }}
                class="reg-pill"
                style="{pillStyle(reg.type)}; padding: 4px 8px; border-radius: 9999px; font-size: 10px; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"
                title={reg.id}
              >
                {reg.shortName}
              </span>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom Scrollbar for dark theme */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #111827; 
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #374151; 
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #4b5563; 
  }

  .btn {
    @apply px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded border border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .reg-pill {
    white-space: nowrap;
  }
</style>