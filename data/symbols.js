// Math notation commonly found in ML papers, with JS equivalents.
//
//   symbol   how it is written
//   names    what you can type to find it (`aidict sym nabla`)
//   short    a few-word gloss, shown in formula legends
//   meaning  the full definition, shown by `aidict sym` and under "Notation" in entries
//   js       the JS equivalent
//   term     optional id of a full dictionary entry
//   detect   strings/regexes that find this notation inside a formula, so every
//            formula automatically explains the operators it uses

const word = w => new RegExp(`(?<![A-Za-z])${w}(?![A-Za-z])`);

export default [
  // ── Arithmetic & structure ───────────────────────────────────────────────
  { symbol: "/", names: ["divide", "division", "over", "fraction"], short: "divided by", meaning: "Division. a / b is a divided by b. In dy/dx it is part of derivative notation rather than a plain division.", js: "a / b", detect: ["/"] },
  { symbol: "√", names: ["sqrt", "square root", "root"], short: "square root", meaning: "Square root. √x is the number that multiplied by itself gives x; √(…) applies to everything in the parentheses.", js: "Math.sqrt(x)", detect: ["√"] },
  { symbol: "x²", names: ["power", "exponent", "squared", "superscript", "^", "x^n"], short: "superscript: a power (x² = x·x) or an index", meaning: "A raised number or letter is usually a power: x² = x·x, eˣ = e to the x. Written x^2 or x^(2i/d) in plain text. Some papers use a superscript as a label or index instead (W_Qⁱ = the i-th head's W_Q). Check the paper's notation section.", js: "x ** 2  /  Math.pow(x, n)", detect: [/[²³⁴ⁿᵗˣⁱ]|⁻(?!¹)|(?<![⁻ℝ])¹|(?<!ℝ)\^/] },
  { symbol: "xᵢ", names: ["subscript", "index", "x_i", "_"], short: "subscript: an index or label", meaning: "A lowered character is an index or label: xᵢ is the i-th element of x, Wᵢⱼ is row i, column j, W_Q is \"the W for queries\", ∇_θ means \"with respect to θ\". Papers usually count from 1 and JS from 0.", js: "x[i - 1]   // 1-indexed math -> 0-indexed JS", detect: [/[_ᵢⱼₜₖₙₓₘ₀₁₂₃₋₊ₐₑₒᵣ]/] },
  { symbol: "[ … ]", names: ["brackets", "square brackets", "interval", "closed interval", "[a, b]", "(a, b)", "open interval"], short: "a vector/list of values, an interval, or grouping", meaning: "Square brackets can list the elements of a vector ([x₁, …, xₙ]), give an interval of numbers ([0, 1] = 0 ≤ x ≤ 1; a round bracket excludes that end, [0, 1) = 0 ≤ x < 1), or just group a sub-expression, as in 𝔼[…].", js: "[x1, x2, x3]  /  x >= a && x <= b", detect: ["["] },
  { symbol: "{ … }", names: ["braces", "curly braces", "set", "set builder", "such that", "set comprehension", "{x | cond}"], short: "a set, or grouping for a sub/superscript", meaning: "Curly braces either define a set ({1, 2, 3}, or {x | cond} = all x such that cond holds) or group several characters into one subscript or superscript, as in ℝ^{d×r} or lim_{h→0}.", js: "new Set([1, 2, 3])  /  xs.filter(x => cond(x))", detect: ["{"] },
  { symbol: "…", names: ["ellipsis", "dots", "and so on", "cdots", "ldots"], short: "and so on (the pattern continues)", meaning: "Ellipsis: the pattern continues. [x₁, x₂, …, xₙ] means every element from x₁ to xₙ.", js: "Array.from({ length: n }, (_, i) => x[i])", detect: ["…"] },
  { symbol: "←", names: ["assign", "update", "gets", "left arrow", "<-"], short: "update to (assignment)", meaning: "Assignment in algorithms: θ ← θ − η∇L means \"replace θ with the right-hand side\". Like = in code, not mathematical equality.", js: "theta = theta - lr * grad;", detect: ["←"] },
  { symbol: "≤", names: ["less than or equal", "leq", "<=", "≥", "geq", ">=", "<", ">", "less than", "greater than", "comparison"], short: "comparison (≤ at most, ≥ at least)", meaning: "Comparisons: < less than, > greater than, ≤ less than or equal, ≥ greater than or equal.", js: "a <= b  /  a >= b", detect: ["≤", "≥", " > ", " < "] },

  // ── Calculus ─────────────────────────────────────────────────────────────
  { symbol: "∇", names: ["nabla", "del", "grad", "gradient"], short: "gradient (vector of partial derivatives)", meaning: "Gradient. ∇_θ L = vector of partial derivatives of L with respect to each parameter in θ.", js: "grad(loss, params)", term: "gradient", detect: ["∇"] },
  { symbol: "∂", names: ["partial", "curly d"], short: "partial derivative", meaning: "Partial derivative. ∂L/∂w = how L changes when only w changes. ∂² is a second derivative.", js: "(f(w + h) - f(w - h)) / (2 * h)", term: "partial-derivative", detect: ["∂"] },
  { symbol: "d/dx", names: ["derivative", "dx", "f prime", "dy/dx"], short: "derivative", meaning: "Ordinary derivative with respect to x. f′(x) means the same thing. In ∫ … dx, dx says x is the variable being integrated over.", js: "(f(x + h) - f(x - h)) / (2 * h)", term: "derivative" },
  { symbol: "∫", names: ["integral", "integrate"], short: "integral (continuous sum)", meaning: "Integral: a continuous sum, the area under a curve. ∫ p(x) dx = 1 for a density.", js: "xs.reduce((s, x) => s + f(x) * dx, 0)", detect: ["∫"] },
  { symbol: "lim", names: ["limit"], short: "limit: the value approached as …", meaning: "Limit: the value approached as a variable tends to something, e.g. lim_{h→0} = \"as h shrinks toward 0\".", js: "f(1e-9) // approximate", detect: [word("lim")] },

  // ── Sums, products, sets ─────────────────────────────────────────────────
  { symbol: "Σ", names: ["sigma", "sum", "summation", "capital sigma"], short: "sum over the index", meaning: "Summation. Σᵢ₌₁ⁿ xᵢ adds x₁ through xₙ; the subscript says what to sum over. (A bold or matrix Σ can instead mean a covariance or diagonal matrix.)", js: "xs.reduce((a, b) => a + b, 0)", detect: ["Σ"] },
  { symbol: "Π", names: ["pi", "product", "capital pi"], short: "product over the index", meaning: "Product. Πᵢ xᵢ multiplies all xᵢ together.", js: "xs.reduce((a, b) => a * b, 1)", detect: ["Π"] },
  { symbol: "∈", names: ["in", "element of", "member of", "belongs to"], short: "is an element of / has type", meaning: "\"is an element of\". x ∈ ℝⁿ: x is a vector of n reals (read it like a type annotation). i ∈ {1,…,n}: i ranges over 1..n.", js: "set.has(x)", detect: ["∈"] },
  { symbol: "∉", names: ["not in", "not element of"], short: "is not an element of", meaning: "\"is not an element of\".", js: "!set.has(x)", detect: ["∉"] },
  { symbol: "⊂", names: ["subset", "subseteq", "⊆"], short: "is a subset of", meaning: "Subset. A ⊂ B: every element of A is in B. ⊆ allows equality.", js: "[...A].every(x => B.has(x))", detect: ["⊂", "⊆"] },
  { symbol: "∪", names: ["union", "cup"], short: "union", meaning: "Set union: elements in A or B.", js: "new Set([...A, ...B])", detect: ["∪"] },
  { symbol: "∩", names: ["intersection", "cap"], short: "intersection", meaning: "Set intersection: elements in both A and B.", js: "new Set([...A].filter(x => B.has(x)))", detect: ["∩"] },
  { symbol: "∅", names: ["empty set", "emptyset", "null set"], short: "empty set", meaning: "The empty set.", js: "new Set()", detect: ["∅"] },
  { symbol: "|S|", names: ["cardinality", "size of set", "absolute value", "abs", "|x|"], short: "absolute value or size", meaning: "For a number: absolute value. For a set: number of elements. For a matrix: often the determinant.", js: "Math.abs(x)  /  S.size" },

  // ── Logic ────────────────────────────────────────────────────────────────
  { symbol: "∀", names: ["for all", "forall", "for every", "every"], short: "for all", meaning: "\"for all\". ∀i: xᵢ > 0 means every element is positive.", js: "xs.every(x => x > 0)", detect: ["∀"] },
  { symbol: "∃", names: ["exists", "there exists", "some"], short: "there exists", meaning: "\"there exists\". ∃i: xᵢ > 0 means at least one is positive.", js: "xs.some(x => x > 0)", detect: ["∃"] },
  { symbol: "¬", names: ["not", "negation", "neg"], short: "not", meaning: "Logical NOT.", js: "!a", detect: ["¬"] },
  { symbol: "∧", names: ["and", "wedge", "logical and"], short: "and", meaning: "Logical AND.", js: "a && b", detect: ["∧"] },
  { symbol: "∨", names: ["or", "vee", "logical or"], short: "or", meaning: "Logical OR.", js: "a || b", detect: ["∨"] },
  { symbol: "⇒", names: ["implies", "then", "=>"], short: "implies", meaning: "Implies: if the left is true, so is the right.", js: "!a || b", detect: ["⇒"] },
  { symbol: "⇔", names: ["iff", "if and only if", "equivalent"], short: "if and only if", meaning: "If and only if: both sides are true together or false together.", js: "a === b", detect: ["⇔"] },

  // ── Number sets ──────────────────────────────────────────────────────────
  { symbol: "ℝ", names: ["reals", "real numbers", "R", "blackboard R"], short: "the real numbers", meaning: "The real numbers. ℝⁿ = length-n vectors; ℝ^{m×n} = m×n matrices; ℝ⁺ = positive reals.", js: "number  /  Float64Array", detect: [/ℝ(?!\^)/] },
  { symbol: "ℕ", names: ["naturals", "natural numbers", "N"], short: "the natural numbers", meaning: "The natural numbers {0, 1, 2, …} (some authors start at 1).", js: "Number.isInteger(n) && n >= 0", detect: ["ℕ"] },
  { symbol: "ℤ", names: ["integers", "Z"], short: "the integers", meaning: "The integers {…, −1, 0, 1, …}.", js: "Number.isInteger(n)", detect: ["ℤ"] },
  { symbol: "ℝ^{m×n}", names: ["matrix shape", "dimensions", "shape"], short: "an m×n matrix of real numbers", meaning: "The set of real m×n matrices. W ∈ ℝ^{m×n} tells you W's shape: m rows, n columns.", js: "[m, n] = [W.length, W[0].length]", term: "matrix", detect: ["ℝ^"] },

  // ── Linear algebra ───────────────────────────────────────────────────────
  { symbol: "xᵀ", names: ["transpose", "superscript T", "^T"], short: "transpose (rows ↔ columns)", meaning: "Transpose: rows ↔ columns. xᵀy is the dot product of column vectors x and y.", js: "A[0].map((_, j) => A.map(r => r[j]))", term: "transpose", detect: ["ᵀ"] },
  { symbol: "A⁻¹", names: ["inverse", "^-1", "matrix inverse"], short: "inverse", meaning: "Matrix inverse (A⁻¹A = I). For functions, f⁻¹ is the inverse function. Note e⁻ˣ is a power (1/eˣ), not an inverse.", js: "// use a linear-algebra library", term: "matrix-inverse", detect: ["⁻¹"] },
  { symbol: "‖x‖", names: ["norm", "double bars", "||x||", "magnitude", "length"], short: "norm (length of a vector)", meaning: "Norm (length) of x. ‖x‖₂ is Euclidean, ‖x‖₁ sum of absolute values, ‖x‖_F Frobenius. (A single ‖ inside KL(p ‖ q) is a separator, not a norm.)", js: "Math.hypot(...x)", term: "norm", detect: [/‖[^‖]+‖/] },
  { symbol: "⟨x, y⟩", names: ["inner product", "angle brackets", "<x,y>"], short: "inner (dot) product", meaning: "Inner (dot) product of x and y.", js: "x.reduce((s, xi, i) => s + xi * y[i], 0)", term: "dot-product", detect: ["⟨"] },
  { symbol: "·", names: ["cdot", "dot product", "times", "multiply"], short: "multiplied by (or dot product of vectors)", meaning: "Multiplication. Between two vectors, a · b is the dot product.", js: "a * b  /  dot(a, b)", term: "dot-product", detect: ["·"] },
  { symbol: "⊙", names: ["hadamard", "odot", "elementwise", "circle dot"], short: "element-wise product", meaning: "Element-wise (Hadamard) product of same-shape arrays.", js: "a.map((x, i) => x * b[i])", term: "hadamard-product", detect: ["⊙"] },
  { symbol: "⊗", names: ["otimes", "outer product", "kronecker", "tensor product"], short: "outer product", meaning: "Outer / Kronecker / tensor product (some ML papers misuse it for element-wise; check the notation section).", js: "u.map(ui => v.map(vj => ui * vj))", term: "outer-product", detect: ["⊗"] },
  { symbol: "⊕", names: ["oplus", "xor", "direct sum", "concat"], short: "XOR, direct sum, or concatenation", meaning: "Context-dependent: XOR, direct sum, or (in many ML papers) concatenation.", js: "[...a, ...b]  /  a ^ b", detect: ["⊕"] },
  { symbol: "×", names: ["times", "cross", "by"], short: "\"by\" in a shape (d×r), or times", meaning: "Shape separator (a 3×4 matrix has 3 rows and 4 columns), ordinary multiplication, or the cross product of 3D vectors.", js: "a * b", detect: ["×"] },
  { symbol: "I", names: ["identity", "identity matrix", "eye"], short: "identity matrix", meaning: "Identity matrix (1s on the diagonal). Iₙ is n×n.", js: "Array.from({length:n}, (_, i) => Array.from({length:n}, (_, j) => +(i === j)))", term: "identity-matrix" },
  { symbol: "diag(v)", names: ["diag", "diagonal"], short: "diagonal matrix", meaning: "Diagonal matrix with v on its diagonal (or extract the diagonal of a matrix).", js: "v.map((x, i) => v.map((_, j) => (i === j ? x : 0)))", term: "identity-matrix", detect: [word("diag")] },
  { symbol: "tr(A)", names: ["trace", "tr"], short: "trace (sum of the diagonal)", meaning: "Trace: sum of a square matrix's diagonal entries.", js: "A.reduce((s, row, i) => s + row[i], 0)", detect: [word("tr")] },
  { symbol: "det(A)", names: ["determinant", "det"], short: "determinant", meaning: "Determinant: how much A scales volume; 0 means A is singular (not invertible).", js: "a * d - b * c  // 2×2 case", term: "matrix-inverse", detect: [word("det")] },

  // ── Probability ──────────────────────────────────────────────────────────
  { symbol: "𝔼", names: ["E", "expectation", "expected value", "blackboard E", "E[x]"], short: "expected value (average)", meaning: "Expectation. 𝔼_{x~p}[f(x)] = average of f(x) with x drawn from p.", js: "samples.map(f).reduce((a, b) => a + b, 0) / samples.length", term: "expected-value", detect: ["𝔼"] },
  { symbol: "P(A | B)", names: ["conditional", "given", "bar", "pipe", "p(x|y)", "|"], short: "\"given\": probability conditioned on what follows", meaning: "Probability of A given B. The bar reads \"given\".", js: "countAandB / countB", term: "conditional-probability", detect: [/(?<!\{\s*)[\p{L}\p{N})\u0000]\s*\|\s*[\p{L}\p{N}(\u0000]/u] },
  { symbol: "~", names: ["tilde", "sim", "distributed as", "sampled from", "∼"], short: "is sampled from", meaning: "\"is distributed as / sampled from\". x ~ 𝒩(0, 1): x is drawn from a standard normal.", js: "const x = randn();", term: "probability-distribution", detect: ["~", "∼"] },
  { symbol: "𝒩(μ, σ²)", names: ["normal", "gaussian", "N", "script N"], short: "Gaussian (normal) distribution", meaning: "Gaussian (normal) distribution with mean μ and variance σ².", js: "mu + sigma * randn()", term: "gaussian", detect: ["𝒩"] },
  { symbol: "𝒰(a, b)", names: ["uniform", "U", "script U"], short: "uniform distribution", meaning: "Uniform distribution between a and b.", js: "a + (b - a) * Math.random()", detect: ["𝒰"] },
  { symbol: "D_KL(p ‖ q)", names: ["KL", "kl divergence", "D_KL", "relative entropy"], short: "KL divergence (difference between distributions)", meaning: "KL divergence from q to p: how different q is from p. The ‖ just separates the two distributions.", js: "p.reduce((s, pi, i) => s + pi * Math.log(pi / q[i]), 0)", term: "kl-divergence", detect: [/KL\(/, " ‖ "] },
  { symbol: "H(p)", names: ["entropy", "H"], short: "entropy", meaning: "Entropy of distribution p. H(p, q) is cross-entropy.", js: "-p.reduce((s, x) => s + x * Math.log(x), 0)", term: "entropy" },
  { symbol: "𝟙[cond]", names: ["indicator", "indicator function", "1[]", "iverson bracket"], short: "indicator: 1 if true, else 0", meaning: "Indicator: 1 if the condition is true, else 0.", js: "Number(cond)  // or +cond", detect: ["𝟙"] },
  { symbol: "∝", names: ["proportional", "proportional to", "propto"], short: "is proportional to", meaning: "\"is proportional to\": equal up to a constant factor (often a normalizer you can ignore).", js: "// y = k * x for some constant k", detect: ["∝"] },

  // ── Relations & definitions ──────────────────────────────────────────────
  { symbol: "≈", names: ["approx", "approximately", "approximately equal"], short: "approximately equal", meaning: "Approximately equal.", js: "Math.abs(a - b) < 1e-6", detect: ["≈"] },
  { symbol: "≜", names: ["defined as", ":=", "triangleq", "equals by definition", "≡"], short: "is defined as", meaning: "\"is defined as\". Also written := or ≡.", js: "const x = ...;", detect: ["≜", ":=", "≡"] },
  { symbol: "≪", names: ["much less than", "<<"], short: "much less than", meaning: "Much less than (orders of magnitude), e.g. r ≪ d in LoRA.", js: "a * 100 < b  // informal", detect: ["≪"] },
  { symbol: "≫", names: ["much greater than", ">>"], short: "much greater than", meaning: "Much greater than.", js: "a > b * 100  // informal", detect: ["≫"] },
  { symbol: "→", names: ["arrow", "maps to", "tends to", "to", "->"], short: "tends to (in a limit) or maps to", meaning: "In a limit, \"tends to\" (h→0: h shrinks toward 0). In a function type, f: ℝⁿ → ℝ takes a vector and returns a number.", js: "(x: number[]) => number", detect: ["→"] },
  { symbol: "↦", names: ["mapsto", "|->"], short: "maps to", meaning: "Maps an element to its value: x ↦ x² is the function x => x².", js: "x => x ** 2", detect: ["↦"] },
  { symbol: "∘", names: ["compose", "composition", "circ"], short: "function composition", meaning: "Function composition: (f ∘ g)(x) = f(g(x)). Occasionally used for element-wise product.", js: "const compose = (f, g) => x => f(g(x));", detect: ["∘"] },
  { symbol: "O(·)", names: ["big o", "order", "complexity"], short: "big-O: growth rate", meaning: "Big-O: growth rate ignoring constants.", js: "// O(n²): nested loop over n", term: "big-o", detect: [/(?<![A-Za-z])O\(/] },
  { symbol: "∞", names: ["infinity", "inf"], short: "infinity", meaning: "Infinity. −∞ is used to mask attention scores.", js: "Infinity  /  -Infinity", term: "causal-mask", detect: ["∞"] },

  // ── Decorations ──────────────────────────────────────────────────────────
  { symbol: "ŷ", names: ["hat", "y hat", "estimate", "prediction"], short: "hat: an estimate or prediction", meaning: "Hat = estimated/predicted value. ŷ is the model's prediction of the true y; x̂ is a normalized or corrected x.", js: "const yHat = model(x);", detect: ["̂", "ŷ"] },
  { symbol: "x̄", names: ["bar", "x bar", "overline", "mean"], short: "bar: a mean or cumulative value", meaning: "Bar = mean/average (sometimes a cumulative product, as ᾱ in diffusion, or a complement).", js: "xs.reduce((a, b) => a + b, 0) / xs.length", term: "expected-value", detect: ["̄", "ᾱ"] },
  { symbol: "x̃", names: ["tilde accent", "x tilde", "noisy", "perturbed"], short: "tilde accent: a modified/noisy version", meaning: "Tilde accent = a modified, noisy, or approximate version of x.", js: "const xTilde = x.map(v => v + noise());", detect: ["̃"] },
  { symbol: "x*", names: ["star", "optimal", "asterisk", "x star"], short: "star: the optimal value", meaning: "Star = optimal value, e.g. θ* = argmin L(θ). Between two functions, f * g is convolution.", js: "const best = argmin(loss, candidates);", detect: [/\p{L}\*/u] },
  { symbol: "x′", names: ["prime", "x prime", "x'"], short: "prime: an updated value or a derivative", meaning: "Prime = a new/updated value or another instance (x and x′), or the derivative f′(x).", js: "const xNext = update(x);", detect: ["′", "'"] },
  { symbol: "x⁽ⁱ⁾", names: ["superscript parentheses", "x^(i)", "example index"], short: "the i-th example", meaning: "Superscript in parentheses = the i-th training example (not a power).", js: "dataset[i]", detect: ["⁽"] },
  { symbol: "x_{<t}", names: ["x less than t", "prefix", "x_<t", "x_{1:t}"], short: "everything before position t", meaning: "All elements before position t (x₁…xₜ₋₁). x_{1:t} is the slice from 1 to t inclusive.", js: "x.slice(0, t - 1)   // x_{<t} with 1-indexing", detect: [/<[ₜᵢ]|_\{?</] },
  { symbol: "⌊x⌋", names: ["floor"], short: "round down", meaning: "Floor: round down.", js: "Math.floor(x)", detect: ["⌊"] },
  { symbol: "⌈x⌉", names: ["ceil", "ceiling"], short: "round up", meaning: "Ceiling: round up.", js: "Math.ceil(x)", detect: ["⌈"] },
  { symbol: "n!", names: ["factorial"], short: "factorial", meaning: "Factorial: n × (n−1) × … × 1.", js: "range(1, n + 1).reduce((a, b) => a * b, 1)", detect: [/\p{L}!/u] },
  { symbol: "(n k)", names: ["binomial", "choose", "n choose k", "combination"], short: "n choose k", meaning: "Binomial coefficient: number of ways to choose k items from n.", js: "fact(n) / (fact(k) * fact(n - k))" },

  // ── Named functions ──────────────────────────────────────────────────────
  { symbol: "exp(x)", names: ["exp", "e^x", "exponential"], short: "e raised to the power (e ≈ 2.718)", meaning: "Exponential: e raised to x (e ≈ 2.718). Always positive, grows very fast.", js: "Math.exp(x)", detect: [word("exp")] },
  { symbol: "log", names: ["ln", "logarithm", "natural log"], short: "natural logarithm", meaning: "In ML papers, log almost always means natural log (ln). log₂ is base 2.", js: "Math.log(x)  /  Math.log2(x)", term: "logarithm", detect: [word("log"), word("ln")] },
  { symbol: "max / min", names: ["max", "min", "maximum", "minimum"], short: "largest / smallest value", meaning: "max(a, b) is the larger value. max_x f(x) is the largest value f reaches; min_G means \"choose G to minimize\".", js: "Math.max(a, b)  /  Math.min(a, b)", detect: [word("max"), word("min")] },
  { symbol: "argmax", names: ["arg max", "argmin", "arg min"], short: "the input that gives the max (or min)", meaning: "The input that maximizes (minimizes) a function, not the max value itself.", js: "xs.indexOf(Math.max(...xs))", term: "argmax", detect: [word("argmax"), word("argmin")] },
  { symbol: "sin, cos, tanh", names: ["sin", "cos", "sine", "cosine", "tanh", "trig", "trigonometric"], short: "sine / cosine / hyperbolic tangent", meaning: "Trigonometric functions: sin and cos are waves between −1 and 1 (and give the coordinates of a rotation); tanh squashes any number into (−1, 1).", js: "Math.sin(x)  /  Math.cos(x)  /  Math.tanh(x)", detect: [word("sin"), word("cos"), word("tanh")] },
  { symbol: "σ", names: ["sigma lowercase", "lowercase sigma", "sigmoid", "standard deviation"], short: "sigmoid, or a standard deviation", meaning: "Either the sigmoid function σ(x) or a standard deviation (σ² = variance). Check context.", js: "1 / (1 + Math.exp(-x))", term: "sigmoid" },

  // ── Greek letters with conventional meanings ─────────────────────────────
  { symbol: "θ", names: ["theta"], short: "model parameters", meaning: "Model parameters (all weights). f_θ is a model parameterized by θ.", js: "const params = model.weights;", term: "parameters" },
  { symbol: "φ, ψ", names: ["phi", "psi"], short: "parameters of a second network", meaning: "Often the parameters of a second network (e.g. encoder φ vs decoder θ), or a feature map φ(x).", js: "const encoderParams = ...;" },
  { symbol: "η", names: ["eta", "learning rate"], short: "learning rate", meaning: "Usually the learning rate.", js: "const lr = 3e-4;", term: "learning-rate" },
  { symbol: "α", names: ["alpha"], short: "a rate or scaling coefficient", meaning: "Learning rate, a mixing/scaling coefficient, or attention weights αᵢⱼ. Check context.", js: "const alpha = 0.1;" },
  { symbol: "β", names: ["beta"], short: "a coefficient (momentum, KL weight, shift)", meaning: "Optimizer momentum coefficients (β₁, β₂ in Adam), a KL penalty weight (RLHF/DPO), or a bias/shift parameter in normalization.", js: "const beta1 = 0.9, beta2 = 0.999;", term: "adam" },
  { symbol: "γ", names: ["gamma"], short: "discount factor or scale", meaning: "RL discount factor (how much future rewards count), or the learned scale in normalization layers.", js: "const gamma = 0.99;", term: "reinforcement-learning" },
  { symbol: "λ", names: ["lambda"], short: "a weight/strength, or an eigenvalue", meaning: "Regularization strength, an eigenvalue, or a Lagrange multiplier.", js: "const lambda = 0.01;", term: "regularization" },
  { symbol: "μ", names: ["mu"], short: "mean", meaning: "Mean.", js: "xs.reduce((a, b) => a + b, 0) / xs.length", term: "expected-value" },
  { symbol: "ε", names: ["epsilon", "eps", "ϵ"], short: "a tiny constant, or noise", meaning: "A tiny constant for numerical stability (e.g. 1e-8), a small tolerance, or Gaussian noise ε ~ 𝒩(0, I) in diffusion/VAEs.", js: "const eps = 1e-8;" },
  { symbol: "τ", names: ["tau", "temperature"], short: "temperature", meaning: "Temperature (softmax/contrastive), a time constant, or a trajectory in RL.", js: "softmax(logits.map(z => z / tau))", term: "temperature" },
  { symbol: "π", names: ["pi lowercase", "policy"], short: "a policy (RL), or 3.14159…", meaning: "In RL: the policy π(a|s). Otherwise the constant 3.14159…", js: "Math.PI  /  policy(state)", term: "reinforcement-learning" },
  { symbol: "ρ", names: ["rho"], short: "a ratio or correlation", meaning: "A probability ratio (PPO), a correlation coefficient, or a density.", js: "const rho = pNew / pOld;" },
  { symbol: "δ", names: ["delta lowercase", "small change", "error term"], short: "a small change or error signal", meaning: "A small change, an error signal in backprop, or the Dirac/Kronecker delta.", js: "const delta = 1e-5;" },
  { symbol: "Δ", names: ["delta", "change", "capital delta"], short: "change in", meaning: "A change or difference: ΔW is an update to weights W.", js: "const dW = W.map((w, i) => wNew[i] - w);", detect: ["Δ"] },
  { symbol: "ℒ", names: ["script L", "L", "loss", "lagrangian"], short: "loss function or Lagrangian", meaning: "Loss function, or a Lagrangian.", js: "const loss = lossFn(pred, target);", term: "loss-function" },
  { symbol: "ℓ", names: ["script l", "ell", "log-likelihood"], short: "log-likelihood or a per-example loss", meaning: "Usually a log-likelihood ℓ(θ) or a per-example loss.", js: "const ell = Math.log(p);", term: "likelihood" },
  { symbol: "𝒟", names: ["script D", "D", "dataset"], short: "a dataset", meaning: "A dataset, e.g. 𝒟 = {(xᵢ, yᵢ)}.", js: "const dataset = [{ x, y }, ...];", detect: ["𝒟"] },
];
