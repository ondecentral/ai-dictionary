// Math terminology that shows up constantly in ML papers.
// Schema is documented in CONTRIBUTING.md and enforced by test/data.test.js.

export default [
  // ── Linear algebra ───────────────────────────────────────────────────────
  {
    id: "scalar",
    term: "Scalar",
    aliases: ["scalars"],
    tags: ["linear-algebra"],
    short: "A single number (as opposed to a vector or matrix).",
    definition:
      "Usually written in plain italic lowercase (x, α, λ). Multiplying a vector by a scalar scales every element. A rank-0 tensor.",
    formula: "x ∈ ℝ",
    js: `const alpha = 0.5;
const scaled = v.map(x => alpha * x);`,
    related: ["vector", "tensor"],
  },
  {
    id: "vector",
    term: "Vector",
    aliases: ["vectors", "column vector", "row vector"],
    tags: ["linear-algebra"],
    short: "An ordered list of numbers; geometrically, a point or arrow in n-dimensional space.",
    definition:
      "Written in bold lowercase (𝐱) or with an arrow. x ∈ ℝⁿ means x is a vector of n real numbers. Papers treat vectors as columns by default, so xᵀ is a row. In JS it is just a number array (or a Float32Array for speed).",
    formula: "x = [x₁, x₂, …, xₙ]ᵀ ∈ ℝⁿ",
    js: `const x = [0.2, -1.3, 4.0];          // x ∈ ℝ³
const fast = new Float32Array(x);`,
    related: ["scalar", "matrix", "dot-product", "norm", "embedding"],
  },
  {
    id: "matrix",
    term: "Matrix",
    aliases: ["matrices"],
    tags: ["linear-algebra"],
    short: "A 2D grid of numbers with m rows and n columns.",
    definition:
      "Written in bold uppercase (𝐖, 𝐗). W ∈ ℝ^{m×n} has m rows and n columns; Wᵢⱼ is row i, column j. Neural network weights are matrices, and a batch of vectors stacked as rows is a matrix.",
    formula: "W ∈ ℝ^{m×n}",
    js: `const W = [[1, 2, 3],
           [4, 5, 6]];           // 2×3
const [m, n] = [W.length, W[0].length];
W[1][2];                        // W₂₃ = 6 (0-indexed in JS!)`,
    related: ["vector", "tensor", "matrix-multiplication", "transpose"],
  },
  {
    id: "tensor",
    term: "Tensor",
    aliases: ["tensors", "ndarray", "shape", "rank of a tensor"],
    tags: ["linear-algebra"],
    short: "A multi-dimensional array; scalars, vectors and matrices are tensors of rank 0, 1, 2.",
    definition:
      "In ML, \"tensor\" just means an n-dimensional array with a shape, e.g. [batch, seqLen, dModel]. (Physicists mean something more specific.) Libraries store tensors as a flat typed array plus shape and strides.",
    formula: "X ∈ ℝ^{B×T×d}",
    js: `// [batch=2][seq=3][d=4] as a flat buffer
const shape = [2, 3, 4];
const data = new Float32Array(2 * 3 * 4);
const at = (b, t, i) => data[(b * 3 + t) * 4 + i];`,
    related: ["matrix", "vector", "scalar"],
  },
  {
    id: "dot-product",
    term: "Dot Product",
    aliases: ["inner product", "scalar product"],
    tags: ["linear-algebra"],
    short: "Multiply two vectors element-wise and sum: a single number measuring alignment.",
    definition:
      "Large and positive when vectors point the same way, zero when orthogonal, negative when opposed. Equals ‖a‖‖b‖cos θ. Attention scores, similarity search and every neuron's weighted sum are dot products.",
    formula: "a · b = aᵀb = ⟨a, b⟩ = Σᵢ aᵢbᵢ",
    js: `const dot = (a, b) => a.reduce((s, ai, i) => s + ai * b[i], 0);
dot([1, 2, 3], [4, 5, 6]); // 32`,
    related: ["cosine-similarity", "norm", "matrix-multiplication", "orthogonal"],
  },
  {
    id: "matrix-multiplication",
    term: "Matrix Multiplication",
    aliases: ["matmul", "matrix product", "GEMM", "matrix-vector product"],
    tags: ["linear-algebra"],
    short: "(AB)ᵢⱼ is the dot product of row i of A with column j of B.",
    definition:
      "A (m×k) times B (k×n) gives C (m×n); the inner dimensions must match. Not commutative: AB ≠ BA in general. Almost all neural-network compute is matrix multiplication, which is why GPUs/TPUs are built around it. Written AB, A·B, or A @ B in Python.",
    formula: "Cᵢⱼ = Σₖ Aᵢₖ Bₖⱼ",
    js: `const matmul = (A, B) =>
  A.map(row => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
const matvec = (A, x) => A.map(row => dot(row, x));`,
    related: ["matrix", "dot-product", "linear-transformation", "transpose"],
  },
  {
    id: "transpose",
    term: "Transpose",
    aliases: ["transposed", "Aᵀ"],
    tags: ["linear-algebra"],
    short: "Flip a matrix over its diagonal: rows become columns.",
    definition:
      "Written Aᵀ (or A′, A^T). If A is m×n, Aᵀ is n×m with (Aᵀ)ᵢⱼ = Aⱼᵢ. Useful identity: (AB)ᵀ = BᵀAᵀ. The QKᵀ in attention transposes K so each query can be dotted with each key.",
    formula: "(Aᵀ)ᵢⱼ = Aⱼᵢ",
    js: `const transpose = A => A[0].map((_, j) => A.map(row => row[j]));`,
    related: ["matrix", "matrix-multiplication"],
  },
  {
    id: "hadamard-product",
    term: "Hadamard Product",
    aliases: ["element-wise product", "elementwise multiplication", "pointwise product", "Schur product"],
    tags: ["linear-algebra"],
    short: "Multiply two same-shaped arrays element by element (⊙).",
    definition:
      "Not to be confused with matrix multiplication. Written ⊙ or ∘ (sometimes ⊗ or * in ML papers — check the paper's notation section). Used in gating (LSTM, GLU) and normalization's learned scale.",
    formula: "(A ⊙ B)ᵢⱼ = Aᵢⱼ · Bᵢⱼ",
    js: `const hadamard = (a, b) => a.map((x, i) => x * b[i]);`,
    related: ["matrix-multiplication", "outer-product"],
  },
  {
    id: "outer-product",
    term: "Outer Product",
    aliases: ["tensor product"],
    tags: ["linear-algebra"],
    short: "Two vectors make a matrix: every element of one times every element of the other.",
    definition:
      "u (m) ⊗ v (n) = uvᵀ, an m×n matrix of rank 1. Weight gradients for a linear layer are outer products of the upstream gradient and the input. LoRA's update BA is a sum of r outer products.",
    formula: "(u ⊗ v)ᵢⱼ = uᵢvⱼ,   u ⊗ v = uvᵀ",
    js: `const outer = (u, v) => u.map(ui => v.map(vj => ui * vj));`,
    related: ["dot-product", "rank", "hadamard-product"],
  },
  {
    id: "identity-matrix",
    term: "Identity Matrix",
    aliases: ["identity", "diagonal matrix"],
    tags: ["linear-algebra"],
    short: "Square matrix with 1s on the diagonal and 0s elsewhere; IA = A.",
    definition:
      "Written I or Iₙ. Behaves like the number 1 for matrix multiplication. A diagonal matrix (diag(v)) has arbitrary values on the diagonal and zeros elsewhere — multiplying by it scales each coordinate. 𝒩(0, I) is a Gaussian with independent unit-variance dimensions.",
    formula: "Iᵢⱼ = 1 if i = j else 0",
    js: `const eye = n => Array.from({ length: n }, (_, i) =>
  Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));`,
    related: ["matrix", "matrix-inverse"],
  },
  {
    id: "matrix-inverse",
    term: "Matrix Inverse",
    aliases: ["inverse", "invertible", "singular matrix", "pseudoinverse", "determinant"],
    tags: ["linear-algebra"],
    short: "A⁻¹ undoes A: A⁻¹A = I. Exists only for square, non-singular matrices.",
    definition:
      "A matrix is singular (non-invertible) when its determinant is 0 — it squashes space into a lower dimension and information is lost. In practice you rarely compute inverses explicitly; you solve linear systems instead. The Moore–Penrose pseudoinverse A⁺ generalises to non-square matrices (least squares).",
    formula: "A⁻¹A = AA⁻¹ = I",
    related: ["identity-matrix", "rank", "linear-transformation"],
  },
  {
    id: "norm",
    term: "Norm",
    aliases: ["L2 norm", "L1 norm", "Euclidean norm", "magnitude", "Frobenius norm", "vector norm", "‖x‖"],
    tags: ["linear-algebra"],
    short: "A vector's length or size, written ‖x‖.",
    definition:
      "L2 (Euclidean) norm: square root of the sum of squares — ordinary length. L1: sum of absolute values. L∞: the largest absolute value. The Frobenius norm is the L2 norm of a matrix flattened into a vector. Dividing a vector by its norm normalises it to length 1.",
    formula: "‖x‖₂ = √(Σ xᵢ²),   ‖x‖₁ = Σ |xᵢ|",
    js: `const l2 = x => Math.hypot(...x);
const l1 = x => x.reduce((s, v) => s + Math.abs(v), 0);
const normalize = x => { const n = l2(x); return x.map(v => v / n); };`,
    related: ["euclidean-distance", "cosine-similarity", "regularization", "gradient-clipping"],
  },
  {
    id: "euclidean-distance",
    term: "Euclidean Distance",
    aliases: ["L2 distance", "distance", "Manhattan distance"],
    tags: ["linear-algebra", "similarity"],
    short: "Straight-line distance between two points: ‖a − b‖.",
    definition:
      "Smaller = more similar. For unit-length (normalised) vectors, ranking by Euclidean distance gives the same order as ranking by cosine similarity, since ‖a − b‖² = 2 − 2cos θ. Manhattan (L1) distance sums absolute differences instead.",
    formula: "d(a, b) = ‖a − b‖₂ = √(Σ (aᵢ − bᵢ)²)",
    js: `const dist = (a, b) => Math.hypot(...a.map((ai, i) => ai - b[i]));`,
    related: ["norm", "cosine-similarity", "vector-database"],
  },
  {
    id: "cosine-similarity",
    term: "Cosine Similarity",
    aliases: ["cosine distance", "cos sim", "cosine"],
    tags: ["linear-algebra", "similarity"],
    short: "The cosine of the angle between two vectors: 1 = same direction, 0 = unrelated, −1 = opposite.",
    definition:
      "Dot product divided by both lengths, so it ignores magnitude and only compares direction. The standard similarity metric for text embeddings. Cosine distance = 1 − cosine similarity. If vectors are pre-normalised, cosine similarity is just the dot product.",
    formula: "cos(a, b) = (a · b) / (‖a‖ ‖b‖)",
    js: `const cosineSimilarity = (a, b) =>
  dot(a, b) / (Math.hypot(...a) * Math.hypot(...b));`,
    related: ["dot-product", "norm", "embedding", "euclidean-distance"],
  },
  {
    id: "linear-transformation",
    term: "Linear Transformation",
    aliases: ["linear map", "linear layer", "linear projection", "affine transformation", "linear"],
    tags: ["linear-algebra"],
    short: "A function f(x) = Wx that preserves addition and scaling; every matrix is one.",
    definition:
      "Linear means f(a + b) = f(a) + f(b) and f(cx) = c·f(x). Geometrically: rotations, scalings, shears and projections. Adding a bias (Wx + b) makes it affine. A neural \"linear layer\" is an affine map; the nonlinearity in between is what makes networks expressive.",
    formula: "f(x) = Wx + b",
    js: `const linear = (W, b) => x => matvec(W, x).map((v, i) => v + b[i]);`,
    related: ["matrix-multiplication", "projection", "activation-function"],
  },
  {
    id: "orthogonal",
    term: "Orthogonal",
    aliases: ["orthogonality", "orthonormal", "perpendicular", "orthogonal matrix"],
    tags: ["linear-algebra"],
    short: "Perpendicular: two vectors whose dot product is 0.",
    definition:
      "Orthonormal vectors are orthogonal and unit length. An orthogonal matrix Q has orthonormal columns, so QᵀQ = I and it only rotates/reflects without stretching — which keeps signals stable, hence orthogonal initialisation. In high dimensions, random vectors are nearly orthogonal.",
    formula: "a · b = 0,   QᵀQ = I",
    js: `const isOrthogonal = (a, b, eps = 1e-9) => Math.abs(dot(a, b)) < eps;`,
    related: ["dot-product", "projection", "svd"],
  },
  {
    id: "projection",
    term: "Projection",
    aliases: ["project", "projected", "projection matrix", "down-projection", "up-projection"],
    tags: ["linear-algebra"],
    short: "Mapping a vector onto a subspace; in ML papers, often just \"multiply by a weight matrix\".",
    definition:
      "Strictly, projecting b onto a gives the component of b in a's direction. In ML writing, \"project to d dimensions\" loosely means apply a learned linear layer that changes the dimension (e.g. the Q/K/V projections, or an FFN's up- and down-projections).",
    formula: "proj_a(b) = (a · b / a · a) a",
    js: `const proj = (a, b) => { const s = dot(a, b) / dot(a, a); return a.map(x => s * x); };`,
    related: ["linear-transformation", "orthogonal", "dot-product"],
  },
  {
    id: "eigenvalue",
    term: "Eigenvalue",
    aliases: ["eigenvector", "eigenvalues", "eigenvectors", "eigendecomposition", "spectral"],
    tags: ["linear-algebra"],
    short: "A direction (eigenvector) that a matrix only stretches, and the stretch factor (eigenvalue).",
    definition:
      "For square A, if Av = λv then v is an eigenvector and λ its eigenvalue. They reveal how a transformation behaves: repeated multiplication by A blows up if |λ| > 1 and vanishes if |λ| < 1 — the root of exploding/vanishing gradients in RNNs. PCA uses eigenvectors of the covariance matrix.",
    formula: "Av = λv",
    js: `// Power iteration: find the dominant eigenvector
let v = A.map(() => Math.random());
for (let i = 0; i < 100; i++) v = normalize(matvec(A, v));
const lambda = dot(v, matvec(A, v));`,
    related: ["svd", "matrix", "vanishing-gradient"],
  },
  {
    id: "svd",
    term: "Singular Value Decomposition",
    aliases: ["SVD", "singular values", "PCA", "principal component analysis", "dimensionality reduction"],
    tags: ["linear-algebra"],
    short: "Factor any matrix as rotation × scaling × rotation: A = UΣVᵀ.",
    definition:
      "Σ is diagonal with non-negative singular values in decreasing order. Keeping only the top-k gives the best rank-k approximation of A — the basis of compression, PCA (dimensionality reduction) and the intuition behind LoRA.",
    formula: "A = U Σ Vᵀ",
    related: ["eigenvalue", "rank", "orthogonal", "lora"],
  },
  {
    id: "rank",
    term: "Rank",
    aliases: ["low-rank", "low rank", "full rank", "matrix rank", "rank-deficient"],
    tags: ["linear-algebra"],
    short: "The number of linearly independent rows/columns — the true dimensionality of a matrix's output.",
    definition:
      "A low-rank matrix can be written as a product of two thin matrices, so it has far fewer degrees of freedom than its size suggests. LoRA bets that fine-tuning updates are low-rank. Don't confuse with a tensor's \"rank\" (number of dimensions) or a ranking.",
    formula: "rank(BA) ≤ r  for B ∈ ℝ^{d×r}, A ∈ ℝ^{r×d}",
    related: ["svd", "lora", "outer-product", "matrix-inverse"],
  },

  // ── Calculus ─────────────────────────────────────────────────────────────
  {
    id: "derivative",
    term: "Derivative",
    aliases: ["derivatives", "differentiation", "differentiable", "slope", "d/dx"],
    tags: ["calculus"],
    short: "The instantaneous rate of change of a function: how much f changes per tiny change in x.",
    definition:
      "Written f′(x), df/dx or d/dx f. Geometrically the slope of the tangent line. Training needs every operation to be differentiable so gradients can be computed. You can check a derivative numerically with a finite difference.",
    formula: "f′(x) = lim_{h→0} (f(x + h) − f(x)) / h",
    js: `const derivative = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
derivative(x => x ** 2, 3); // ≈ 6`,
    related: ["partial-derivative", "gradient", "chain-rule"],
  },
  {
    id: "partial-derivative",
    term: "Partial Derivative",
    aliases: ["partial derivatives", "∂", "partial"],
    tags: ["calculus"],
    short: "Derivative with respect to one variable while holding the others fixed (∂f/∂x).",
    definition:
      "For f(x, y), ∂f/∂x asks: if I nudge only x, how does f change? A loss depends on millions of parameters; its partial derivative with respect to each one says how to adjust that parameter.",
    formula: "∂f/∂xᵢ = lim_{h→0} (f(…, xᵢ + h, …) − f(…)) / h",
    js: `const partial = (f, xs, i, h = 1e-5) => {
  const up = [...xs]; up[i] += h;
  const dn = [...xs]; dn[i] -= h;
  return (f(up) - f(dn)) / (2 * h);
};`,
    related: ["derivative", "gradient", "jacobian"],
  },
  {
    id: "gradient",
    term: "Gradient",
    aliases: ["gradients", "∇", "nabla", "grad", "del"],
    tags: ["calculus"],
    short: "The vector of all partial derivatives; points in the direction of steepest increase.",
    definition:
      "∇f (\"nabla f\" / \"grad f\") collects ∂f/∂xᵢ for every input into one vector. Its direction is uphill and its length is how steep. ∇_θ L means the gradient of the loss with respect to the parameters θ. Gradient descent steps the opposite way.",
    formula: "∇f(x) = [∂f/∂x₁, …, ∂f/∂xₙ]",
    js: `const gradient = (f, xs) => xs.map((_, i) => partial(f, xs, i));
gradient(([x, y]) => x * x + 3 * y, [2, 5]); // ≈ [4, 3]`,
    related: ["partial-derivative", "gradient-descent", "backpropagation", "jacobian"],
  },
  {
    id: "chain-rule",
    term: "Chain Rule",
    aliases: ["chain rule of calculus"],
    tags: ["calculus"],
    short: "Derivative of a composition = product of the derivatives: (f∘g)′ = f′(g(x))·g′(x).",
    definition:
      "If y depends on u which depends on x, then dy/dx = dy/du · du/dx. A neural network is a long composition of functions, so its gradient is a long product of local derivatives — computed efficiently by backpropagation. (Not to be confused with the chain rule of probability.)",
    formula: "dy/dx = (dy/du) · (du/dx)",
    js: `// y = sin(x²)  ->  dy/dx = cos(x²) · 2x
const dydx = x => Math.cos(x ** 2) * 2 * x;`,
    related: ["derivative", "backpropagation", "jacobian"],
  },
  {
    id: "jacobian",
    term: "Jacobian",
    aliases: ["Jacobian matrix"],
    tags: ["calculus"],
    short: "Matrix of all first-order partial derivatives of a vector-valued function.",
    definition:
      "For f: ℝⁿ → ℝᵐ, the Jacobian J is m×n with Jᵢⱼ = ∂fᵢ/∂xⱼ. It is the best linear approximation of f near a point. Backprop never builds full Jacobians; it computes vector-Jacobian products (VJPs), which is far cheaper.",
    formula: "Jᵢⱼ = ∂fᵢ / ∂xⱼ",
    related: ["gradient", "hessian", "chain-rule", "backpropagation"],
  },
  {
    id: "hessian",
    term: "Hessian",
    aliases: ["Hessian matrix", "second derivative", "second-order", "curvature"],
    tags: ["calculus", "optimization"],
    short: "Matrix of second derivatives; describes the curvature of a function.",
    definition:
      "Hᵢⱼ = ∂²f/∂xᵢ∂xⱼ. Positive-definite Hessian at a critical point → local minimum. Second-order optimizers (Newton's method) use it to take smarter steps, but for n parameters it has n² entries, so deep learning sticks to first-order methods or cheap approximations.",
    formula: "Hᵢⱼ = ∂²f / ∂xᵢ∂xⱼ",
    related: ["jacobian", "gradient", "convexity"],
  },
  {
    id: "convexity",
    term: "Convex",
    aliases: ["convexity", "convex function", "non-convex", "nonconvex", "local minimum", "global minimum", "saddle point"],
    tags: ["calculus", "optimization"],
    short: "Bowl-shaped: any local minimum is the global minimum.",
    definition:
      "A function is convex if the line segment between any two points on its graph lies on or above the graph. Convex problems (linear/logistic regression) are reliably solvable. Neural-network losses are non-convex, full of saddle points and many local minima — yet gradient descent works remarkably well in practice.",
    formula: "f(tx + (1−t)y) ≤ t f(x) + (1−t) f(y),  t ∈ [0, 1]",
    related: ["gradient-descent", "hessian"],
  },
  {
    id: "lagrange-multiplier",
    term: "Lagrange Multiplier",
    aliases: ["Lagrangian", "constrained optimization", "dual", "subject to", "s.t."],
    tags: ["calculus", "optimization"],
    short: "Technique for optimising a function subject to constraints (\"s.t.\" in papers).",
    definition:
      "To optimise f(x) subject to g(x) = 0, form the Lagrangian ℒ = f(x) − λg(x) and find where its gradient is zero. Papers often write \"maximise … s.t. KL ≤ δ\" and then convert the constraint into a penalty term with coefficient λ or β.",
    formula: "ℒ(x, λ) = f(x) − λ g(x)",
    related: ["regularization", "gradient"],
  },

  // ── Functions ────────────────────────────────────────────────────────────
  {
    id: "argmax",
    term: "Argmax",
    aliases: ["arg max", "argmin", "arg min"],
    tags: ["functions"],
    short: "The input (index) that gives the maximum value — not the maximum value itself.",
    definition:
      "max returns the biggest value; argmax returns where it is. argmax over logits is the predicted class or greedy next token. argmin is the location of the minimum; θ* = argmin_θ L(θ) reads \"the best parameters are those minimising the loss\".",
    formula: "argmaxₓ f(x) = { x | f(x) is maximal }",
    js: `const argmax = xs => xs.reduce((best, x, i) => (x > xs[best] ? i : best), 0);
argmax([0.1, 0.7, 0.2]); // 1`,
    related: ["softmax", "greedy-decoding"],
  },
  {
    id: "softmax",
    term: "Softmax",
    aliases: ["softargmax", "normalized exponential", "softmax function"],
    tags: ["functions", "probability"],
    short: "Turns a vector of arbitrary scores into probabilities that are positive and sum to 1.",
    definition:
      "Exponentiate each score and divide by the total. Larger scores get disproportionately more weight — a \"soft\" version of argmax. Always subtract the max before exponentiating for numerical stability (the result is unchanged). Used for classification outputs, LLM next-token distributions and attention weights.",
    formula: "softmax(z)ᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)",
    js: `function softmax(z) {
  const m = Math.max(...z);                 // stability trick
  const e = z.map(v => Math.exp(v - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map(v => v / s);
}`,
    related: ["logits", "temperature", "argmax", "sigmoid", "log-sum-exp", "cross-entropy"],
  },
  {
    id: "sigmoid",
    term: "Sigmoid",
    aliases: ["logistic function", "σ(x)", "logistic sigmoid", "logistic regression"],
    tags: ["functions", "activation"],
    short: "Squashes any number into (0, 1): σ(x) = 1 / (1 + e⁻ˣ).",
    definition:
      "Used for binary probabilities, gates in LSTMs/GLUs, and logistic regression. It saturates (gradient ≈ 0) for large |x|, so it is a poor hidden-layer activation in deep nets. Softmax over two classes reduces to a sigmoid. Note σ is also used for standard deviation — check context.",
    formula: "σ(x) = 1 / (1 + e⁻ˣ),   σ′(x) = σ(x)(1 − σ(x))",
    js: `const sigmoid = x => 1 / (1 + Math.exp(-x));`,
    related: ["softmax", "tanh", "logits", "activation-function"],
  },
  {
    id: "tanh",
    term: "Tanh",
    aliases: ["hyperbolic tangent"],
    tags: ["functions", "activation"],
    short: "Squashes any number into (−1, 1); a zero-centred cousin of sigmoid.",
    definition:
      "tanh(x) = 2σ(2x) − 1. Common in RNNs and as a component of GELU's approximation. Like sigmoid it saturates for large |x|. Built into JS as Math.tanh.",
    formula: "tanh(x) = (eˣ − e⁻ˣ) / (eˣ + e⁻ˣ)",
    js: `Math.tanh(0.5); // 0.462`,
    related: ["sigmoid", "activation-function", "rnn"],
  },
  {
    id: "log-sum-exp",
    term: "Log-Sum-Exp",
    aliases: ["LSE", "logsumexp", "log-sum-exp trick", "numerical stability", "underflow", "overflow"],
    tags: ["functions", "numerics"],
    short: "log(Σ exp(xᵢ)), computed stably by factoring out the max.",
    definition:
      "Math.exp(1000) is Infinity and multiplying many small probabilities underflows to 0. Working in log space and using the LSE trick avoids both. It's a smooth approximation of max, and log-softmax = x − LSE(x).",
    formula: "LSE(x) = m + log Σ exp(xᵢ − m),  m = max(x)",
    js: `const logSumExp = xs => {
  const m = Math.max(...xs);
  return m + Math.log(xs.reduce((s, x) => s + Math.exp(x - m), 0));
};
const logSoftmax = xs => { const l = logSumExp(xs); return xs.map(x => x - l); };`,
    related: ["softmax", "logarithm", "cross-entropy"],
  },
  {
    id: "logarithm",
    term: "Logarithm",
    aliases: ["log", "ln", "natural log", "log probability", "logprob", "logprobs", "log space"],
    tags: ["functions", "numerics"],
    short: "The inverse of exponentiation; in ML papers \"log\" almost always means natural log (ln).",
    definition:
      "Logs turn products into sums: log(ab) = log a + log b. Since sequence probabilities are products of many small numbers, models work with log-probabilities (always ≤ 0). Information theory sometimes uses log₂ (bits) instead of ln (nats).",
    formula: "log(ab) = log a + log b",
    js: `Math.log(x);   // natural log, = ln
Math.log2(x);  // bits
// product of probs -> sum of logprobs
const logp = probs.reduce((s, p) => s + Math.log(p), 0);`,
    related: ["log-sum-exp", "likelihood", "entropy"],
  },
  {
    id: "one-hot",
    term: "One-Hot Encoding",
    aliases: ["one-hot", "one hot", "one-hot vector", "indicator vector"],
    tags: ["functions", "data"],
    short: "A vector of zeros with a single 1 at the index of the category.",
    definition:
      "Represents a class or token ID as a vector. Cross-entropy with a one-hot target reduces to −log of the probability of the correct class. Multiplying a one-hot vector by an embedding matrix just selects a row — which is why embedding layers are implemented as lookups.",
    formula: "e_k = [0, …, 0, 1, 0, …, 0]   (1 at position k)",
    js: `const oneHot = (k, n) => Array.from({ length: n }, (_, i) => (i === k ? 1 : 0));`,
    related: ["cross-entropy", "embedding", "ground-truth"],
  },
  {
    id: "interpolation",
    term: "Interpolation",
    aliases: ["lerp", "linear interpolation", "slerp", "extrapolation", "convex combination"],
    tags: ["functions"],
    short: "Blend between two values: lerp(a, b, t) = (1 − t)a + tb.",
    definition:
      "A convex combination is a weighted average with non-negative weights summing to 1 (attention outputs are convex combinations of values). Slerp interpolates along a sphere, used for latent vectors and model-weight merging. Extrapolation goes beyond the known range (e.g. longer contexts than seen in training).",
    formula: "lerp(a, b, t) = (1 − t)·a + t·b",
    js: `const lerp = (a, b, t) => a.map((ai, i) => (1 - t) * ai + t * b[i]);`,
    related: ["latent-space", "attention"],
  },

  // ── Probability & statistics ─────────────────────────────────────────────
  {
    id: "probability-distribution",
    term: "Probability Distribution",
    aliases: ["distribution", "PDF", "PMF", "probability density", "categorical distribution", "uniform distribution", "support"],
    tags: ["probability"],
    short: "Assigns probabilities to every possible outcome; they sum (or integrate) to 1.",
    definition:
      "Discrete distributions (PMF) assign a probability to each outcome — an LLM's next-token output is a categorical distribution over the vocabulary. Continuous ones (PDF) assign density. p(x), P(x) and q(x) usually denote distributions; p is often the true/data distribution and q the model's approximation.",
    formula: "Σₓ p(x) = 1   or   ∫ p(x) dx = 1",
    js: `// Sample from a categorical distribution
function sample(probs) {
  let r = Math.random();
  for (let i = 0; i < probs.length; i++) if ((r -= probs[i]) < 0) return i;
  return probs.length - 1;
}`,
    related: ["gaussian", "expected-value", "conditional-probability", "softmax"],
  },
  {
    id: "conditional-probability",
    term: "Conditional Probability",
    aliases: ["P(A|B)", "given", "joint probability", "marginal", "marginal probability", "marginalization", "chain rule of probability"],
    tags: ["probability"],
    short: "P(A | B): the probability of A given that B is known to be true.",
    definition:
      "Read the bar \"|\" as \"given\". P(A, B) is the joint probability of both. Marginalising sums out a variable: P(A) = Σ_b P(A, b). The chain rule of probability, P(x₁…xₙ) = Π P(xᵢ | x<ᵢ), is exactly how autoregressive language models define text probability.",
    formula: "P(A | B) = P(A, B) / P(B)",
    js: `// From counts
const pAgivenB = countBoth / countB;`,
    related: ["bayes-theorem", "autoregressive", "probability-distribution"],
  },
  {
    id: "bayes-theorem",
    term: "Bayes' Theorem",
    aliases: ["Bayes theorem", "Bayes rule", "Bayes' rule", "Bayesian", "prior", "posterior", "evidence"],
    tags: ["probability"],
    short: "Update beliefs with evidence: posterior ∝ likelihood × prior.",
    definition:
      "The prior P(H) is your belief before seeing data; the likelihood P(D|H) is how well the hypothesis explains the data; the posterior P(H|D) is your updated belief. The denominator P(D) (\"evidence\") is often intractable, which motivates approximations like variational inference (VAEs) and MCMC.",
    formula: "P(H | D) = P(D | H) · P(H) / P(D)",
    js: `const posterior = (likelihood, prior, evidence) => (likelihood * prior) / evidence;`,
    related: ["conditional-probability", "likelihood", "vae"],
  },
  {
    id: "expected-value",
    term: "Expected Value",
    aliases: ["expectation", "mean", "average", "𝔼", "E[x]", "μ"],
    tags: ["probability", "statistics"],
    short: "The probability-weighted average outcome, written 𝔼[X].",
    definition:
      "𝔼_{x~p}[f(x)] reads \"the average of f(x) when x is drawn from p\". Most ML objectives are expectations over the data distribution, which we estimate by averaging over a mini-batch (a Monte Carlo estimate). μ commonly denotes the mean.",
    formula: "𝔼[X] = Σₓ x · p(x)",
    js: `const expected = (values, probs) => values.reduce((s, v, i) => s + v * probs[i], 0);
const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;  // sample estimate`,
    related: ["variance", "monte-carlo", "probability-distribution"],
  },
  {
    id: "variance",
    term: "Variance",
    aliases: ["standard deviation", "std", "σ²", "covariance", "covariance matrix", "stddev"],
    tags: ["probability", "statistics"],
    short: "How spread out values are around the mean; standard deviation σ is its square root.",
    definition:
      "Var(X) = 𝔼[(X − μ)²]. Standard deviation σ = √Var has the same units as the data. Covariance measures how two variables vary together; a covariance matrix Σ holds it for every pair of dimensions. \"High-variance gradient estimates\" means noisy ones.",
    formula: "Var(X) = σ² = 𝔼[(X − μ)²]",
    js: `const variance = xs => { const m = mean(xs); return mean(xs.map(x => (x - m) ** 2)); };
const std = xs => Math.sqrt(variance(xs));`,
    related: ["expected-value", "gaussian", "standardization"],
  },
  {
    id: "gaussian",
    term: "Gaussian Distribution",
    aliases: ["normal distribution", "Gaussian", "Gaussian noise", "bell curve", "𝒩(μ, σ²)", "standard normal"],
    tags: ["probability"],
    short: "The bell curve, 𝒩(μ, σ²), defined by a mean and variance.",
    definition:
      "Ubiquitous because sums of many independent effects tend toward it (central limit theorem) and it's mathematically convenient. 𝒩(0, I) is the standard multivariate normal: independent dimensions, each mean 0 and variance 1. Used for weight initialisation, noise in diffusion models and VAE latents.",
    formula: "p(x) = (1 / √(2πσ²)) · exp(−(x − μ)² / 2σ²)",
    js: `// Box–Muller transform: sample from N(mu, sigma²)
const randn = (mu = 0, sigma = 1) =>
  mu + sigma * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());`,
    related: ["variance", "probability-distribution", "diffusion-model", "vae"],
  },
  {
    id: "iid",
    term: "i.i.d.",
    aliases: ["iid", "independent and identically distributed", "independent", "independence"],
    tags: ["probability", "statistics"],
    short: "Independent and identically distributed: each sample is drawn separately from the same distribution.",
    definition:
      "The standard assumption about training data. Independence means one sample tells you nothing about another; identically distributed means they all come from the same source. Violations (distribution shift, correlated samples) are a major cause of models failing in production. Shuffling data helps approximate i.i.d. mini-batches.",
    formula: "x₁, …, xₙ ~ p  i.i.d.",
    related: ["probability-distribution", "stochastic"],
  },
  {
    id: "likelihood",
    term: "Likelihood",
    aliases: ["log-likelihood", "negative log-likelihood", "NLL", "log likelihood"],
    tags: ["probability", "statistics"],
    short: "How probable the observed data is under a model with given parameters, viewed as a function of the parameters.",
    definition:
      "Probability fixes the parameters and asks about data; likelihood fixes the data and asks about parameters: L(θ) = p(data | θ). We maximise log-likelihood (sum, not product), or equivalently minimise negative log-likelihood (NLL), which for classification is cross-entropy.",
    formula: "ℓ(θ) = Σᵢ log p(xᵢ | θ)",
    js: `const nll = probsOfCorrect => -probsOfCorrect.reduce((s, p) => s + Math.log(p), 0);`,
    related: ["mle", "cross-entropy", "logarithm", "bayes-theorem"],
  },
  {
    id: "mle",
    term: "Maximum Likelihood Estimation",
    aliases: ["MLE", "maximum likelihood", "MAP", "maximum a posteriori"],
    tags: ["statistics"],
    short: "Choose the parameters that make the observed data most probable.",
    definition:
      "θ_MLE = argmax_θ Σ log p(xᵢ | θ). Training a language model with cross-entropy loss is MLE. MAP (maximum a posteriori) also includes a prior over θ, which is equivalent to adding a regularization term (Gaussian prior ⇔ L2).",
    formula: "θ* = argmax_θ Σᵢ log p(xᵢ | θ)",
    related: ["likelihood", "argmax", "regularization", "cross-entropy"],
  },
  {
    id: "entropy",
    term: "Entropy",
    aliases: ["Shannon entropy", "H(p)", "information", "bits", "nats", "uncertainty"],
    tags: ["information-theory"],
    short: "Average uncertainty (surprise) of a distribution, in bits or nats.",
    definition:
      "Entropy is maximised by a uniform distribution and is zero for a certain outcome. Surprise of an event is −log p(x); entropy is the expected surprise. A fair coin has 1 bit of entropy. LLM sampling with high temperature increases the entropy of the output distribution.",
    formula: "H(p) = −Σₓ p(x) log p(x)",
    js: `const entropy = p => -p.reduce((s, pi) => s + (pi > 0 ? pi * Math.log2(pi) : 0), 0);
entropy([0.5, 0.5]); // 1 bit`,
    related: ["cross-entropy", "kl-divergence", "mutual-information", "perplexity"],
  },
  {
    id: "cross-entropy",
    term: "Cross-Entropy",
    aliases: ["cross entropy", "cross-entropy loss", "CE loss", "log loss", "categorical cross-entropy", "binary cross-entropy", "BCE"],
    tags: ["information-theory", "loss"],
    short: "The standard classification / language-model loss: −log of the probability assigned to the correct answer.",
    definition:
      "H(p, q) measures the average surprise when outcomes from p are coded using q. With a one-hot target p, it simplifies to −log q(correct class). Minimising it is the same as maximum likelihood. Cross-entropy = entropy + KL divergence, so minimising it pushes q toward p.",
    formula: "H(p, q) = −Σₓ p(x) log q(x)",
    js: `const crossEntropy = (logits, target) => -logSoftmax(logits)[target];`,
    related: ["entropy", "kl-divergence", "softmax", "likelihood", "loss-function", "one-hot"],
  },
  {
    id: "kl-divergence",
    term: "KL Divergence",
    aliases: ["KL", "Kullback-Leibler divergence", "relative entropy", "KL penalty", "D_KL"],
    tags: ["information-theory"],
    short: "How different distribution q is from reference p; zero only if they are identical.",
    definition:
      "D_KL(p ‖ q) is the extra bits needed when using q to encode data from p. Always ≥ 0 and not symmetric (so not a true distance). Appears in VAEs (keep latents near a prior), RLHF (keep the policy near the reference model) and distillation.",
    formula: "D_KL(p ‖ q) = Σₓ p(x) log(p(x) / q(x))",
    js: `const kl = (p, q) => p.reduce((s, pi, i) => s + (pi > 0 ? pi * Math.log(pi / q[i]) : 0), 0);`,
    related: ["entropy", "cross-entropy", "rlhf", "vae", "distillation"],
  },
  {
    id: "mutual-information",
    term: "Mutual Information",
    aliases: ["MI", "I(X;Y)", "information gain"],
    tags: ["information-theory"],
    short: "How much knowing one variable reduces uncertainty about another.",
    definition:
      "I(X; Y) = H(X) − H(X | Y). Zero when X and Y are independent. Contrastive objectives like InfoNCE maximise a lower bound on mutual information between paired views.",
    formula: "I(X; Y) = H(X) − H(X | Y)",
    related: ["entropy", "kl-divergence", "contrastive-learning"],
  },
  {
    id: "monte-carlo",
    term: "Monte Carlo",
    aliases: ["Monte Carlo estimate", "Monte Carlo sampling", "sampling", "MCMC", "Markov chain Monte Carlo", "rollout"],
    tags: ["probability"],
    short: "Estimate a quantity by averaging over random samples.",
    definition:
      "Instead of computing an expectation exactly (often impossible), draw N samples and average; error shrinks like 1/√N. Mini-batch losses, RL return estimates and MCMC (sampling from complicated distributions via a Markov chain) are all Monte Carlo methods.",
    formula: "𝔼[f(x)] ≈ (1/N) Σᵢ f(xᵢ),  xᵢ ~ p",
    js: `// Estimate π
let inside = 0;
for (let i = 0; i < 1e6; i++) if (Math.random() ** 2 + Math.random() ** 2 < 1) inside++;
const pi = (4 * inside) / 1e6;`,
    related: ["expected-value", "stochastic", "markov-chain"],
  },
  {
    id: "markov-chain",
    term: "Markov Chain",
    aliases: ["Markov property", "Markov", "MDP", "Markov decision process", "state transition"],
    tags: ["probability"],
    short: "A random process where the next state depends only on the current state.",
    definition:
      "The Markov property means \"memoryless\": the future depends on the present, not the full history. A Markov decision process (MDP) adds actions and rewards and is the formal framework for reinforcement learning. Diffusion models' noising process is also a Markov chain.",
    formula: "P(sₜ₊₁ | sₜ, sₜ₋₁, …) = P(sₜ₊₁ | sₜ)",
    js: `const transitions = { sunny: [["sunny", 0.8], ["rainy", 0.2]], rainy: [["sunny", 0.4], ["rainy", 0.6]] };
const next = s => { let r = Math.random(); for (const [t, p] of transitions[s]) if ((r -= p) < 0) return t; return s; };`,
    related: ["reinforcement-learning", "monte-carlo", "diffusion-model"],
  },
  {
    id: "stochastic",
    term: "Stochastic",
    aliases: ["random", "randomness", "nondeterministic", "deterministic", "seed", "random seed"],
    tags: ["probability"],
    short: "Involving randomness; the opposite of deterministic.",
    definition:
      "Stochastic gradient descent uses random batches; stochastic sampling picks tokens randomly. Fixing the random seed makes runs reproducible. Math.random() can't be seeded, so use a seeded PRNG when you need reproducibility in JS.",
    js: `// mulberry32: tiny seedable PRNG
const mulberry32 = a => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rand = mulberry32(42);`,
    related: ["sgd", "monte-carlo", "iid"],
  },
  {
    id: "standardization",
    term: "Standardization",
    aliases: ["z-score", "normalization", "normalize", "feature scaling", "min-max scaling", "whitening"],
    tags: ["statistics", "data"],
    short: "Rescale data to mean 0 and standard deviation 1.",
    definition:
      "z = (x − μ) / σ. Puts features on comparable scales so optimisation behaves well. \"Normalization\" is overloaded: it can mean standardization, min-max scaling to [0, 1], dividing a vector by its norm, or layer/batch norm — check context.",
    formula: "z = (x − μ) / σ",
    js: `const standardize = xs => { const m = mean(xs), s = std(xs); return xs.map(x => (x - m) / s); };`,
    related: ["variance", "layer-normalization", "norm"],
  },

  // ── Misc ─────────────────────────────────────────────────────────────────
  {
    id: "big-o",
    term: "Big-O Notation",
    aliases: ["big O", "O(n)", "O(n²)", "complexity", "time complexity", "quadratic", "asymptotic"],
    tags: ["complexity"],
    short: "Describes how cost grows with input size, ignoring constants: O(n), O(n²), O(n log n).",
    definition:
      "Same notation you know from algorithms. ML papers use it for compute and memory, e.g. attention is O(n²·d) in sequence length n, which is why so many papers propose \"linear attention\" or other sub-quadratic alternatives.",
    formula: "Attention: O(n² d)   FFN: O(n d²)",
    js: `// O(n²): every token compared with every token
for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) score(i, j);`,
    related: ["flops", "attention"],
  },
  {
    id: "sparse",
    term: "Sparse",
    aliases: ["sparsity", "dense", "sparse matrix", "sparse attention", "pruning"],
    tags: ["linear-algebra", "performance"],
    short: "Mostly zeros (or mostly inactive); the opposite of dense.",
    definition:
      "Sparse data can be stored and computed efficiently by skipping zeros. Sparse models activate only part of the network per input (mixture of experts); sparse attention only computes some query-key pairs; pruning zeroes out unimportant weights. \"Dense\" embeddings contrast with sparse keyword vectors (TF-IDF, BM25).",
    js: `// Sparse vector as a Map of non-zero entries
const sparse = new Map([[3, 0.5], [1024, 2.1]]);
const sparseDot = (a, b) => { let s = 0; for (const [i, v] of a) s += v * (b.get(i) ?? 0); return s; };`,
    related: ["mixture-of-experts", "regularization"],
  },
  {
    id: "manifold",
    term: "Manifold",
    aliases: ["manifold hypothesis", "data manifold", "submanifold"],
    tags: ["geometry"],
    short: "A space that looks flat locally but can be curved globally (like Earth's surface).",
    definition:
      "The manifold hypothesis says real-world data (e.g. natural images) lies on a much lower-dimensional manifold inside its huge ambient space — most random pixel grids are noise, not photos. Deep networks are thought to learn to \"unfold\" these manifolds into latent spaces where classes are easy to separate.",
    related: ["latent-space", "embedding"],
  },
];
