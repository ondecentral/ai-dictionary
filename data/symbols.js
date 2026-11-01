// Math notation commonly found in ML papers, with JS equivalents.
// `names` are what you can type to find a symbol (e.g. `aidict sym nabla`).
// `term` optionally links to a full entry in ai.js / math.js.

export default [
  // ── Calculus ─────────────────────────────────────────────────────────────
  { symbol: "∇", names: ["nabla", "del", "grad", "gradient"], meaning: "Gradient. ∇_θ L = vector of partial derivatives of L with respect to each parameter in θ.", js: "grad(loss, params)", term: "gradient" },
  { symbol: "∂", names: ["partial", "curly d", "del"], meaning: "Partial derivative. ∂L/∂w = how L changes when only w changes.", js: "(f(w + h) - f(w - h)) / (2 * h)", term: "partial-derivative" },
  { symbol: "d/dx", names: ["derivative", "dx", "f prime", "f'"], meaning: "Ordinary derivative with respect to x. f′(x) means the same thing.", js: "(f(x + h) - f(x - h)) / (2 * h)", term: "derivative" },
  { symbol: "∫", names: ["integral", "integrate"], meaning: "Integral: continuous sum (area under a curve). ∫ p(x) dx = 1 for a density.", js: "xs.reduce((s, x) => s + f(x) * dx, 0)" },
  { symbol: "lim", names: ["limit"], meaning: "Limit: the value approached as a variable tends to something, e.g. lim_{h→0}.", js: "f(1e-9) // approximate" },

  // ── Sums, products, sets ─────────────────────────────────────────────────
  { symbol: "Σ", names: ["sigma", "sum", "summation", "capital sigma"], meaning: "Summation. Σᵢ₌₁ⁿ xᵢ adds x₁ through xₙ. (Bold or non-summation Σ can also mean a covariance matrix.)", js: "xs.reduce((a, b) => a + b, 0)" },
  { symbol: "Π", names: ["pi", "product", "capital pi"], meaning: "Product. Πᵢ xᵢ multiplies all xᵢ together.", js: "xs.reduce((a, b) => a * b, 1)" },
  { symbol: "∈", names: ["in", "element of", "member of", "belongs to"], meaning: "\"is an element of\". x ∈ ℝⁿ: x is a vector of n reals. i ∈ {1,…,n}: i ranges over 1..n.", js: "set.has(x)" },
  { symbol: "∉", names: ["not in", "not element of"], meaning: "\"is not an element of\".", js: "!set.has(x)" },
  { symbol: "⊂", names: ["subset", "subseteq", "⊆"], meaning: "Subset. A ⊂ B: every element of A is in B. ⊆ allows equality.", js: "[...A].every(x => B.has(x))" },
  { symbol: "∪", names: ["union", "cup"], meaning: "Set union: elements in A or B.", js: "new Set([...A, ...B])" },
  { symbol: "∩", names: ["intersection", "cap"], meaning: "Set intersection: elements in both A and B.", js: "new Set([...A].filter(x => B.has(x)))" },
  { symbol: "∅", names: ["empty set", "emptyset", "null set"], meaning: "The empty set.", js: "new Set()" },
  { symbol: "|S|", names: ["cardinality", "size of set", "absolute value", "abs", "|x|"], meaning: "For a set: number of elements. For a number: absolute value. For a matrix: often determinant.", js: "S.size  /  Math.abs(x)" },
  { symbol: "{x | cond}", names: ["set builder", "such that", "set comprehension"], meaning: "Set-builder notation: all x satisfying cond. Read \"|\" or \":\" as \"such that\".", js: "xs.filter(x => cond(x))" },

  // ── Logic ────────────────────────────────────────────────────────────────
  { symbol: "∀", names: ["for all", "forall", "for every", "every"], meaning: "\"for all\". ∀i: xᵢ > 0 means every element is positive.", js: "xs.every(x => x > 0)" },
  { symbol: "∃", names: ["exists", "there exists", "some"], meaning: "\"there exists\". ∃i: xᵢ > 0 means at least one is positive.", js: "xs.some(x => x > 0)" },
  { symbol: "¬", names: ["not", "negation", "neg"], meaning: "Logical NOT.", js: "!a" },
  { symbol: "∧", names: ["and", "wedge", "logical and"], meaning: "Logical AND.", js: "a && b" },
  { symbol: "∨", names: ["or", "vee", "logical or"], meaning: "Logical OR.", js: "a || b" },
  { symbol: "⇒", names: ["implies", "then", "=>"], meaning: "Implies: if the left is true, so is the right.", js: "!a || b" },
  { symbol: "⇔", names: ["iff", "if and only if", "equivalent"], meaning: "If and only if: both sides are true together or false together.", js: "a === b" },

  // ── Number sets ──────────────────────────────────────────────────────────
  { symbol: "ℝ", names: ["reals", "real numbers", "R", "blackboard R"], meaning: "The real numbers. ℝⁿ = length-n vectors; ℝ^{m×n} = m×n matrices; ℝ⁺ = positive reals.", js: "number  /  Float64Array" },
  { symbol: "ℕ", names: ["naturals", "natural numbers", "N"], meaning: "The natural numbers {0, 1, 2, …} (some authors start at 1).", js: "Number.isInteger(n) && n >= 0" },
  { symbol: "ℤ", names: ["integers", "Z"], meaning: "The integers {…, −1, 0, 1, …}.", js: "Number.isInteger(n)" },
  { symbol: "ℝ^{m×n}", names: ["matrix shape", "dimensions", "shape"], meaning: "The set of real m×n matrices — tells you the shape of a variable.", js: "[m, n] = [W.length, W[0].length]", term: "matrix" },
  { symbol: "[a, b]", names: ["closed interval", "interval", "(a, b)", "open interval"], meaning: "Interval of reals from a to b. Square brackets include the endpoint, round brackets exclude it: [0, 1) means 0 ≤ x < 1.", js: "x >= a && x <= b" },

  // ── Linear algebra ───────────────────────────────────────────────────────
  { symbol: "xᵀ", names: ["transpose", "superscript T", "^T"], meaning: "Transpose: rows ↔ columns. xᵀy is the dot product of column vectors x and y.", js: "A[0].map((_, j) => A.map(r => r[j]))", term: "transpose" },
  { symbol: "A⁻¹", names: ["inverse", "^-1", "matrix inverse"], meaning: "Matrix inverse (A⁻¹A = I). For functions, f⁻¹ is the inverse function.", js: "// use a linear-algebra library", term: "matrix-inverse" },
  { symbol: "‖x‖", names: ["norm", "double bars", "||x||", "magnitude", "length"], meaning: "Norm (length) of x. ‖x‖₂ is Euclidean, ‖x‖₁ sum of absolute values, ‖x‖_F Frobenius.", js: "Math.hypot(...x)", term: "norm" },
  { symbol: "⟨x, y⟩", names: ["inner product", "angle brackets", "<x,y>", "dot"], meaning: "Inner (dot) product of x and y.", js: "x.reduce((s, xi, i) => s + xi * y[i], 0)", term: "dot-product" },
  { symbol: "·", names: ["cdot", "dot product", "times", "multiply"], meaning: "Multiplication or dot product depending on context. a·b for vectors = dot product.", js: "a * b  /  dot(a, b)", term: "dot-product" },
  { symbol: "⊙", names: ["hadamard", "odot", "elementwise", "circle dot"], meaning: "Element-wise (Hadamard) product of same-shape arrays.", js: "a.map((x, i) => x * b[i])", term: "hadamard-product" },
  { symbol: "⊗", names: ["otimes", "outer product", "kronecker", "tensor product"], meaning: "Outer / Kronecker / tensor product (some ML papers misuse it for element-wise — check the notation section).", js: "u.map(ui => v.map(vj => ui * vj))", term: "outer-product" },
  { symbol: "⊕", names: ["oplus", "xor", "direct sum", "concat"], meaning: "Context-dependent: XOR, direct sum, or (in many ML papers) concatenation.", js: "[...a, ...b]  /  a ^ b" },
  { symbol: "×", names: ["times", "cross", "by"], meaning: "Shape separator (3×4 matrix), ordinary multiplication, or cross product of 3D vectors.", js: "a * b" },
  { symbol: "I", names: ["identity", "identity matrix", "eye"], meaning: "Identity matrix (1s on the diagonal). Iₙ is n×n.", js: "Array.from({length:n}, (_, i) => Array.from({length:n}, (_, j) => +(i === j)))", term: "identity-matrix" },
  { symbol: "diag(v)", names: ["diag", "diagonal"], meaning: "Diagonal matrix with v on its diagonal (or extract the diagonal of a matrix).", js: "v.map((x, i) => v.map((_, j) => (i === j ? x : 0)))", term: "identity-matrix" },
  { symbol: "tr(A)", names: ["trace", "tr"], meaning: "Trace: sum of a square matrix's diagonal entries.", js: "A.reduce((s, row, i) => s + row[i], 0)" },
  { symbol: "det(A)", names: ["determinant", "det"], meaning: "Determinant: how much A scales volume; 0 means A is singular (not invertible).", js: "a * d - b * c  // 2×2 case", term: "matrix-inverse" },

  // ── Probability ──────────────────────────────────────────────────────────
  { symbol: "𝔼", names: ["E", "expectation", "expected value", "blackboard E", "E[x]"], meaning: "Expectation. 𝔼_{x~p}[f(x)] = average of f(x) with x drawn from p.", js: "samples.map(f).reduce((a, b) => a + b, 0) / samples.length", term: "expected-value" },
  { symbol: "P(A | B)", names: ["conditional", "given", "bar", "pipe", "p(x|y)"], meaning: "Probability of A given B. The bar reads \"given\".", js: "countAandB / countB", term: "conditional-probability" },
  { symbol: "~", names: ["tilde", "sim", "distributed as", "sampled from", "∼"], meaning: "\"is distributed as / sampled from\". x ~ 𝒩(0, 1): x is drawn from a standard normal.", js: "const x = randn();", term: "probability-distribution" },
  { symbol: "𝒩(μ, σ²)", names: ["normal", "gaussian", "N", "script N"], meaning: "Gaussian (normal) distribution with mean μ and variance σ².", js: "mu + sigma * randn()", term: "gaussian" },
  { symbol: "𝒰(a, b)", names: ["uniform", "U", "script U"], meaning: "Uniform distribution between a and b.", js: "a + (b - a) * Math.random()" },
  { symbol: "D_KL(p ‖ q)", names: ["KL", "kl divergence", "D_KL", "relative entropy"], meaning: "KL divergence from q to p — how different q is from p.", js: "p.reduce((s, pi, i) => s + pi * Math.log(pi / q[i]), 0)", term: "kl-divergence" },
  { symbol: "H(p)", names: ["entropy", "H"], meaning: "Entropy of distribution p. H(p, q) is cross-entropy.", js: "-p.reduce((s, x) => s + x * Math.log(x), 0)", term: "entropy" },
  { symbol: "𝟙[cond]", names: ["indicator", "indicator function", "1[]", "iverson bracket"], meaning: "Indicator: 1 if the condition is true, else 0.", js: "Number(cond)  // or +cond" },
  { symbol: "∝", names: ["proportional", "proportional to", "propto"], meaning: "\"is proportional to\" — equal up to a constant factor (often a normaliser you can ignore).", js: "// y = k * x for some constant k" },

  // ── Relations & definitions ──────────────────────────────────────────────
  { symbol: "≈", names: ["approx", "approximately", "approximately equal"], meaning: "Approximately equal.", js: "Math.abs(a - b) < 1e-6" },
  { symbol: "≜", names: ["defined as", ":=", "triangleq", "equals by definition", "≡"], meaning: "\"is defined as\". Also written := or ≡.", js: "const x = ...;" },
  { symbol: "≪", names: ["much less than", "<<"], meaning: "Much less than (orders of magnitude), e.g. r ≪ d in LoRA.", js: "a * 100 < b  // informal" },
  { symbol: "≫", names: ["much greater than", ">>"], meaning: "Much greater than.", js: "a > b * 100  // informal" },
  { symbol: "→", names: ["arrow", "maps to", "tends to", "to", "->"], meaning: "Function type (f: ℝⁿ → ℝ = takes a vector, returns a number) or \"tends to\" in limits.", js: "(x: number[]) => number" },
  { symbol: "↦", names: ["mapsto", "maps to", "|->"], meaning: "Maps an element to its value: x ↦ x² is the function x => x².", js: "x => x ** 2" },
  { symbol: "∘", names: ["compose", "composition", "circ"], meaning: "Function composition: (f ∘ g)(x) = f(g(x)). Occasionally used for element-wise product.", js: "const compose = (f, g) => x => f(g(x));" },
  { symbol: "O(·)", names: ["big o", "order", "complexity"], meaning: "Big-O: growth rate ignoring constants.", js: "// O(n²): nested loop over n", term: "big-o" },
  { symbol: "∞", names: ["infinity", "inf"], meaning: "Infinity. −∞ is used to mask attention scores.", js: "Infinity  /  -Infinity", term: "causal-mask" },

  // ── Decorations ──────────────────────────────────────────────────────────
  { symbol: "ŷ", names: ["hat", "y hat", "estimate", "prediction"], meaning: "Hat = estimated/predicted value. ŷ is the model's prediction of the true y.", js: "const yHat = model(x);" },
  { symbol: "x̄", names: ["bar", "x bar", "overline", "mean"], meaning: "Bar = mean/average (sometimes complex conjugate or complement).", js: "xs.reduce((a, b) => a + b, 0) / xs.length", term: "expected-value" },
  { symbol: "x̃", names: ["tilde accent", "x tilde", "noisy", "perturbed"], meaning: "Tilde accent = a modified, noisy, or approximate version of x.", js: "const xTilde = x.map(v => v + noise());" },
  { symbol: "x*", names: ["star", "optimal", "asterisk", "x star"], meaning: "Star = optimal value, e.g. θ* = argmin L(θ). Can also mean complex conjugate or convolution.", js: "const best = argmin(loss, candidates);" },
  { symbol: "x′", names: ["prime", "x prime", "x'"], meaning: "Prime = a new/updated value or another instance (x and x′), or the derivative f′(x).", js: "const xNext = update(x);" },
  { symbol: "xᵢ", names: ["subscript", "index", "x_i"], meaning: "Subscript = index into a vector, or the i-th item. Wᵢⱼ is row i, column j. Papers usually count from 1; JS from 0.", js: "x[i - 1]   // 1-indexed math -> 0-indexed JS" },
  { symbol: "x⁽ⁱ⁾", names: ["superscript parentheses", "x^(i)", "example index"], meaning: "Superscript in parentheses = the i-th training example (not a power).", js: "dataset[i]" },
  { symbol: "x^{(l)}", names: ["layer index", "h^(l)", "superscript l"], meaning: "Superscript (l) = layer l. h⁽ˡ⁾ is the hidden state at layer l.", js: "hidden[l]" },
  { symbol: "x_{<t}", names: ["x less than t", "prefix", "x_<t", "x_{1:t}"], meaning: "All elements before position t (x₁…xₜ₋₁). x_{1:t} is the slice from 1 to t inclusive.", js: "x.slice(0, t - 1)   // x_{<t} with 1-indexing" },
  { symbol: "⌊x⌋", names: ["floor"], meaning: "Floor: round down.", js: "Math.floor(x)" },
  { symbol: "⌈x⌉", names: ["ceil", "ceiling"], meaning: "Ceiling: round up.", js: "Math.ceil(x)" },
  { symbol: "n!", names: ["factorial"], meaning: "Factorial: n × (n−1) × … × 1.", js: "range(1, n + 1).reduce((a, b) => a * b, 1)" },
  { symbol: "(n k)", names: ["binomial", "choose", "n choose k", "combination"], meaning: "Binomial coefficient: number of ways to choose k items from n.", js: "fact(n) / (fact(k) * fact(n - k))" },
  { symbol: "exp(x)", names: ["exp", "e^x", "exponential"], meaning: "e raised to x (e ≈ 2.718).", js: "Math.exp(x)" },
  { symbol: "log", names: ["ln", "logarithm", "natural log"], meaning: "In ML papers, log almost always means natural log (ln). log₂ is base 2.", js: "Math.log(x)  /  Math.log2(x)", term: "logarithm" },
  { symbol: "argmax", names: ["arg max", "argmin", "arg min"], meaning: "The input that maximises (minimises) a function, not the max value itself.", js: "xs.indexOf(Math.max(...xs))", term: "argmax" },
  { symbol: "σ", names: ["sigma lowercase", "lowercase sigma", "sigmoid", "standard deviation"], meaning: "Either the sigmoid function σ(x) or a standard deviation (σ² = variance). Check context.", js: "1 / (1 + Math.exp(-x))", term: "sigmoid" },

  // ── Greek letters with conventional meanings ─────────────────────────────
  { symbol: "θ", names: ["theta"], meaning: "Model parameters (all weights). f_θ is a model parameterised by θ.", js: "const params = model.weights;", term: "parameters" },
  { symbol: "φ, ψ", names: ["phi", "psi"], meaning: "Often the parameters of a second network (e.g. encoder φ vs decoder θ), or a feature map φ(x).", js: "const encoderParams = ...;" },
  { symbol: "η", names: ["eta", "learning rate"], meaning: "Usually the learning rate.", js: "const lr = 3e-4;", term: "learning-rate" },
  { symbol: "α", names: ["alpha"], meaning: "Learning rate, a mixing/scaling coefficient, or attention weights αᵢⱼ — check context.", js: "const alpha = 0.1;" },
  { symbol: "β", names: ["beta"], meaning: "Optimizer momentum coefficients (β₁, β₂ in Adam), a KL penalty weight (RLHF/DPO), or a bias/shift parameter in normalization.", js: "const beta1 = 0.9, beta2 = 0.999;", term: "adam" },
  { symbol: "γ", names: ["gamma"], meaning: "RL discount factor (how much future rewards count), or the learned scale in normalization layers.", js: "const gamma = 0.99;", term: "reinforcement-learning" },
  { symbol: "λ", names: ["lambda"], meaning: "Regularization strength, an eigenvalue, or a Lagrange multiplier.", js: "const lambda = 0.01;", term: "regularization" },
  { symbol: "μ", names: ["mu"], meaning: "Mean.", js: "xs.reduce((a, b) => a + b, 0) / xs.length", term: "expected-value" },
  { symbol: "ε", names: ["epsilon", "eps", "ϵ"], meaning: "A tiny constant for numerical stability (e.g. 1e-8), a small tolerance, or Gaussian noise ε ~ 𝒩(0, I) in diffusion/VAEs.", js: "const eps = 1e-8;" },
  { symbol: "τ", names: ["tau", "temperature"], meaning: "Temperature (softmax/contrastive), a time constant, or a trajectory in RL.", js: "softmax(logits.map(z => z / tau))", term: "temperature" },
  { symbol: "π", names: ["pi lowercase", "policy"], meaning: "In RL: the policy π(a|s). Otherwise the constant 3.14159…", js: "Math.PI  /  policy(state)", term: "reinforcement-learning" },
  { symbol: "δ", names: ["delta lowercase", "small change", "error term"], meaning: "A small change, an error signal in backprop, or the Dirac/Kronecker delta.", js: "const delta = 1e-5;" },
  { symbol: "Δ", names: ["delta", "change", "capital delta"], meaning: "A change or difference: ΔW is an update to weights W.", js: "const dW = W.map((w, i) => wNew[i] - w);" },
  { symbol: "ℒ", names: ["script L", "L", "loss", "lagrangian"], meaning: "Loss function, or a Lagrangian.", js: "const loss = lossFn(pred, target);", term: "loss-function" },
  { symbol: "𝒟", names: ["script D", "D", "dataset"], meaning: "A dataset, e.g. 𝒟 = {(xᵢ, yᵢ)}.", js: "const dataset = [{ x, y }, ...];" },
];
