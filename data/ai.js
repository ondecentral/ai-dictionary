// AI / machine-learning terminology.
// Schema is documented in CONTRIBUTING.md and enforced by test/data.test.js.

export default [
  // ── Architectures ────────────────────────────────────────────────────────
  {
    id: "transformer",
    term: "Transformer",
    aliases: ["transformer architecture", "transformer model"],
    tags: ["architecture", "llm"],
    short: "Neural network architecture built from stacked attention + feed-forward blocks; the basis of modern LLMs.",
    definition:
      "Introduced in \"Attention Is All You Need\" (Vaswani et al., 2017). Each layer applies self-attention (every token looks at every other token) followed by a small feed-forward network, with residual connections and layer normalization around both. Because attention processes all positions in parallel, transformers train far faster on GPUs than recurrent networks. GPT-style models use only the decoder stack; BERT-style models use only the encoder.",
    formula: "x = x + Attention(LayerNorm(x))\nx = x + FFN(LayerNorm(x))",
    where: [
      ["x", "the sequence of token vectors flowing through the block"],
      ["Attention", "multi-head self-attention sublayer"],
      ["LayerNorm", "layer normalization applied before each sublayer"],
      ["FFN", "position-wise feed-forward network sublayer"],
      ["x = x +", "residual connection: add the sublayer output back onto x"],
    ],
    js: `// One pre-norm transformer block (shapes: x is [seqLen][dModel])
function transformerBlock(x, p) {
  x = add(x, multiHeadAttention(layerNorm(x), p.attn));
  x = add(x, feedForward(layerNorm(x), p.ffn));
  return x;
}`,
    related: ["self-attention", "multi-head-attention", "feed-forward-network", "residual-connection", "layer-normalization", "encoder-decoder"],
  },
  {
    id: "llm",
    term: "Large Language Model",
    aliases: ["LLM", "LLMs", "language model", "language models", "LM", "GPT", "generative pre-trained transformer"],
    tags: ["llm", "architecture"],
    short: "A very large neural network (usually a decoder-only transformer) trained to predict the next token of text.",
    definition:
      "LLMs are pretrained on trillions of tokens of text with a simple next-token objective, then fine-tuned (SFT, RLHF) to follow instructions. \"Large\" typically means billions of parameters. Despite the simple objective, at scale they acquire broad knowledge and abilities like translation, coding and in-context learning.",
    formula: "p(text) = Π_t p(tokenₜ | tokens<ₜ)",
    where: [
      ["p(text)", "probability the model assigns to the whole text"],
      ["p", "probability under the model"],
      ["tokenₜ", "the token at position t"],
      ["tokens<ₜ", "all tokens before position t (the context so far)"],
      ["Π_t", "multiply the per-token probabilities over every position t"],
    ],
    js: `// Everything an LLM does, conceptually:
let ids = tokenize(prompt);
while (!done(ids)) ids.push(sample(softmax(model(ids).at(-1))));
return detokenize(ids);`,
    related: ["transformer", "autoregressive", "token", "pretraining", "fine-tuning", "scaling-laws"],
  },
  {
    id: "attention",
    term: "Attention",
    aliases: ["attention mechanism", "scaled dot-product attention", "dot-product attention"],
    tags: ["architecture", "llm"],
    short: "Computes a weighted average of values, where weights come from how well a query matches each key.",
    definition:
      "Each position produces a query (Q), key (K) and value (V) vector. Scores are the dot products of a query with every key, scaled by √dₖ to keep them from growing too large, then turned into weights with softmax. The output is the weighted sum of the values. Think of it as a soft, differentiable hash-map lookup: instead of returning the one value whose key matches exactly, it returns a blend of all values weighted by similarity.",
    formula: "Attention(Q, K, V) = softmax(QKᵀ / √dₖ) · V",
    where: [
      ["Attention(Q, K, V)", "attention output for queries Q, keys K and values V"],
      ["Q", "queries: what each position is looking for"],
      ["K", "keys: what each position offers to be matched against"],
      ["V", "values: the content that gets mixed together"],
      ["QKᵀ", "every query dotted with every key = similarity scores"],
      ["dₖ", "dimension of the key vectors; √dₖ keeps scores from growing too large"],
      ["softmax", "turns each row of scores into weights that sum to 1"],
    ],
    js: `// Soft dictionary lookup for a single query vector q
function attention(q, keys, values) {
  const d = q.length;
  const scores = keys.map(k => dot(q, k) / Math.sqrt(d));
  const weights = softmax(scores);            // sums to 1
  return values[0].map((_, j) =>
    values.reduce((acc, v, i) => acc + weights[i] * v[j], 0));
}`,
    related: ["self-attention", "multi-head-attention", "softmax", "dot-product", "causal-mask"],
  },
  {
    id: "self-attention",
    term: "Self-Attention",
    aliases: ["intra-attention"],
    tags: ["architecture", "llm"],
    short: "Attention where queries, keys and values all come from the same sequence.",
    definition:
      "In self-attention each token in a sequence attends to the other tokens in that same sequence, letting the model mix in context (e.g. resolving what \"it\" refers to). Q, K and V are produced by multiplying the same input X by three learned weight matrices. Cost is O(n²) in sequence length because every token is compared with every other token. Contrast with cross-attention, where queries come from one sequence and keys/values from another.",
    formula: "Q = XW_Q,  K = XW_K,  V = XW_V\nout = softmax(QKᵀ / √dₖ) V",
    where: [
      ["X", "input sequence, one row per token"],
      ["W_Q", "learned weight matrix that produces queries (likewise W_K, W_V)"],
      ["W_K", "learned weight matrix that produces keys"],
      ["W_V", "learned weight matrix that produces values"],
      ["Q", "queries"],
      ["K", "keys"],
      ["V", "values"],
      ["dₖ", "key dimension"],
      ["softmax", "normalizes scores into attention weights"],
      ["out", "the attended output, one row per token"],
    ],
    js: `const Q = matmul(X, Wq), K = matmul(X, Wk), V = matmul(X, Wv);
const out = matmul(softmaxRows(scale(matmul(Q, transpose(K)), 1 / Math.sqrt(dk))), V);`,
    related: ["attention", "multi-head-attention", "transformer", "matrix-multiplication"],
  },
  {
    id: "multi-head-attention",
    term: "Multi-Head Attention",
    aliases: ["MHA", "multihead attention", "attention heads", "attention head"],
    tags: ["architecture", "llm"],
    short: "Runs several attention operations in parallel on smaller slices, then concatenates the results.",
    definition:
      "Instead of one attention over the full model dimension, the input is projected into h lower-dimensional \"heads\" (d_model / h each). Each head can specialise in a different relationship (syntax, coreference, position). Outputs are concatenated and projected back with W_O. Variants such as multi-query attention (MQA) and grouped-query attention (GQA) share keys/values across heads to shrink the KV cache.",
    formula: "MultiHead(X) = Concat(head₁, …, head_h) W_O\nheadᵢ = Attention(XW_Qⁱ, XW_Kⁱ, XW_Vⁱ)",
    where: [
      ["MultiHead(X)", "multi-head attention applied to input X"],
      ["headᵢ", "output of the i-th attention head"],
      ["head₁", "the first head"],
      ["head_h", "the last head; h is the number of heads"],
      ["Concat", "join the heads' outputs side by side"],
      ["W_O", "learned output projection back to model dimension"],
      ["Attention", "scaled dot-product attention"],
      ["X", "input sequence"],
      ["W_Qⁱ", "head i's query projection (likewise W_Kⁱ, W_Vⁱ); ⁱ is a head index, not a power"],
      ["W_Kⁱ", "head i's key projection"],
      ["W_Vⁱ", "head i's value projection"],
    ],
    js: `const heads = range(h).map(i =>
  selfAttention(X, Wq[i], Wk[i], Wv[i]));
const out = matmul(concatColumns(heads), Wo);`,
    related: ["attention", "self-attention", "kv-cache"],
  },
  {
    id: "causal-mask",
    term: "Causal Mask",
    aliases: ["attention mask", "look-ahead mask", "causal attention", "masked attention"],
    tags: ["architecture", "llm"],
    short: "Prevents a token from attending to tokens that come after it.",
    definition:
      "Autoregressive models must predict token t using only tokens < t. The causal mask sets attention scores for future positions to −∞ before the softmax, so their weights become exactly 0. The mask is a lower-triangular matrix. Padding masks work the same way but hide padding tokens instead.",
    formula: "scoresᵢⱼ = −∞  if j > i",
    where: [
      ["scoresᵢⱼ", "attention score from query position i to key position j"],
      ["i", "the position doing the attending"],
      ["j", "the position being attended to"],
      ["−∞", "negative infinity; softmax turns it into a weight of exactly 0"],
      ["if j > i", "only for positions in the future of i"],
    ],
    js: `for (let i = 0; i < n; i++)
  for (let j = i + 1; j < n; j++)
    scores[i][j] = -Infinity;   // softmax turns this into 0`,
    related: ["attention", "autoregressive"],
  },
  {
    id: "kv-cache",
    term: "KV Cache",
    aliases: ["key-value cache", "kv caching"],
    tags: ["inference", "llm", "performance"],
    short: "Stores past keys and values during generation so they are not recomputed for every new token.",
    definition:
      "When generating token by token, the keys and values for earlier tokens never change. Caching them turns each generation step from O(n²) recomputation into O(n) work for the single new token. The trade-off is memory: the cache grows linearly with context length × layers × heads, and is often the main memory bottleneck when serving long contexts.",
    js: `const cache = { K: [], V: [] };
function step(xNew) {
  cache.K.push(matvec(Wk, xNew));
  cache.V.push(matvec(Wv, xNew));
  return attention(matvec(Wq, xNew), cache.K, cache.V); // memoised
}`,
    related: ["attention", "autoregressive", "inference", "context-window"],
  },
  {
    id: "flash-attention",
    term: "FlashAttention",
    aliases: ["flash attention"],
    tags: ["performance", "inference"],
    short: "An exact attention algorithm that is fast because it minimises GPU memory reads/writes.",
    definition:
      "FlashAttention (Dao et al., 2022) computes the same result as standard attention but processes Q, K, V in tiles that fit in fast on-chip SRAM, using an online softmax so the full n×n score matrix is never materialised in slow GPU memory. It is \"IO-aware\": the speedup comes from fewer memory transfers, not fewer FLOPs.",
    related: ["attention", "log-sum-exp", "flops"],
  },
  {
    id: "positional-encoding",
    term: "Positional Encoding",
    aliases: ["position embedding", "positional embedding", "sinusoidal encoding"],
    tags: ["architecture", "llm"],
    short: "Injects token order into a transformer, which is otherwise order-blind.",
    definition:
      "Attention treats its input as a set, so \"dog bites man\" and \"man bites dog\" would look identical. Positional encodings add (or rotate in) a position-dependent vector to each token embedding. The original transformer used fixed sine/cosine waves of different frequencies; later models use learned embeddings, RoPE or ALiBi.",
    formula: "PE(pos, 2i) = sin(pos / 10000^(2i/d))\nPE(pos, 2i+1) = cos(pos / 10000^(2i/d))",
    where: [
      ["PE", "the positional encoding vector"],
      ["pos", "token position in the sequence (0, 1, 2, …)"],
      ["2i", "even dimension index; 2i+1 is the odd one next to it"],
      ["d", "model (embedding) dimension"],
      ["10000", "base constant that sets the range of wavelengths"],
      ["sin", "sine wave for even dimensions"],
      ["cos", "cosine wave for odd dimensions"],
    ],
    js: `const pe = (pos, d) => Array.from({ length: d }, (_, k) => {
  const angle = pos / 10000 ** ((2 * Math.floor(k / 2)) / d);
  return k % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
});`,
    related: ["rope", "embedding", "transformer"],
  },
  {
    id: "rope",
    term: "Rotary Position Embedding",
    aliases: ["RoPE", "rotary embedding", "rotary positional embedding"],
    tags: ["architecture", "llm"],
    short: "Encodes position by rotating query/key vector pairs by an angle proportional to position.",
    definition:
      "RoPE (Su et al., 2021) treats each pair of dimensions in Q and K as a 2D point and rotates it by pos·θᵢ. Because the dot product of two rotated vectors depends only on the difference of their angles, attention scores naturally depend on relative position. Used by LLaMA, Mistral and most modern open LLMs; context-extension tricks (NTK scaling, YaRN) tweak θ.",
    formula: "[x₁', x₂'] = [x₁cos(mθ) − x₂sin(mθ), x₁sin(mθ) + x₂cos(mθ)]",
    where: [
      ["x₁', x₂'", "the pair of dimensions after rotation"],
      ["x₁, x₂", "a pair of adjacent dimensions of a query or key vector"],
      ["m", "token position"],
      ["θ", "rotation frequency for this pair of dimensions"],
      ["cos, sin", "cosine and sine: the 2D rotation formula"],
    ],
    js: `function rope(x, pos, base = 10000) {
  const out = [...x];
  for (let i = 0; i < x.length; i += 2) {
    const a = pos / base ** (i / x.length);
    out[i]     = x[i] * Math.cos(a) - x[i + 1] * Math.sin(a);
    out[i + 1] = x[i] * Math.sin(a) + x[i + 1] * Math.cos(a);
  }
  return out;
}`,
    related: ["positional-encoding", "attention", "context-window"],
  },
  {
    id: "feed-forward-network",
    term: "Feed-Forward Network",
    aliases: ["FFN", "MLP", "multilayer perceptron", "position-wise feed-forward", "dense layer", "fully connected layer"],
    tags: ["architecture"],
    short: "Layers of matrix multiply + nonlinearity applied independently to each position.",
    definition:
      "The simplest neural network: y = W₂·σ(W₁x + b₁) + b₂. In a transformer the FFN sits after attention and typically expands the hidden size 4× before projecting back down. A large share of an LLM's parameters (and much of its stored \"knowledge\") lives in these layers. Modern variants use gated activations like SwiGLU.",
    formula: "FFN(x) = W₂ · σ(W₁x + b₁) + b₂",
    where: [
      ["FFN(x)", "the feed-forward network applied to x"],
      ["x", "input vector for one token"],
      ["W₁", "first weight matrix (expands, often 4× wider)"],
      ["b₁", "first bias vector"],
      ["σ", "activation function (ReLU, GELU, …), not standard deviation here"],
      ["W₂", "second weight matrix (projects back down)"],
      ["b₂", "second bias vector"],
    ],
    js: `const ffn = (x, { W1, b1, W2, b2 }) =>
  add(matvec(W2, matvec(W1, x).map((v, i) => relu(v + b1[i]))), b2);`,
    related: ["activation-function", "transformer", "parameters"],
  },
  {
    id: "residual-connection",
    term: "Residual Connection",
    aliases: ["skip connection", "shortcut connection", "residual stream"],
    tags: ["architecture", "training"],
    short: "Adds a layer's input to its output (x + f(x)) so signals and gradients flow through deep networks.",
    definition:
      "Popularised by ResNet (He et al., 2015). Because the identity path is always available, each layer only has to learn a small correction, and gradients can flow straight back through the addition, mitigating vanishing gradients. In transformers the running sum is often called the \"residual stream\".",
    formula: "y = x + f(x)",
    where: [
      ["x", "the input to the layer"],
      ["f(x)", "what the layer computes"],
      ["y", "the output: input plus the layer's correction"],
    ],
    js: `const residual = (x, f) => add(x, f(x));`,
    related: ["vanishing-gradient", "transformer", "layer-normalization"],
  },
  {
    id: "layer-normalization",
    term: "Layer Normalization",
    aliases: ["LayerNorm", "layer norm", "RMSNorm", "RMS norm"],
    tags: ["architecture", "training"],
    short: "Rescales each token's vector to zero mean and unit variance, then applies a learned scale and shift.",
    definition:
      "Normalising activations keeps their magnitudes stable across layers, making training faster and more reliable. LayerNorm normalises across the features of a single example (unlike batch norm, which normalises across the batch), so it works the same at any batch size. RMSNorm, used in LLaMA, skips mean-centering and only divides by the root-mean-square.",
    formula: "LN(x) = γ ⊙ (x − μ) / √(σ² + ε) + β",
    where: [
      ["LN(x)", "layer norm of vector x"],
      ["x", "input vector (one token's features)"],
      ["μ", "mean of x's elements"],
      ["σ²", "variance of x's elements"],
      ["ε", "tiny constant (e.g. 1e-5) to avoid dividing by zero"],
      ["γ", "learned per-feature scale"],
      ["β", "learned per-feature shift"],
    ],
    js: `function layerNorm(x, gamma, beta, eps = 1e-5) {
  const mu = mean(x);
  const v = mean(x.map(xi => (xi - mu) ** 2));
  return x.map((xi, i) => gamma[i] * (xi - mu) / Math.sqrt(v + eps) + beta[i]);
}`,
    related: ["batch-normalization", "standardization", "transformer"],
  },
  {
    id: "batch-normalization",
    term: "Batch Normalization",
    aliases: ["BatchNorm", "batch norm", "BN"],
    tags: ["architecture", "training"],
    short: "Normalises each feature across the examples in a mini-batch.",
    definition:
      "For every feature, BatchNorm subtracts the batch mean and divides by the batch standard deviation, then applies learned γ and β. At inference it uses running averages collected during training. Very common in CNNs; transformers usually prefer layer normalization because sequence lengths and batch sizes vary.",
    formula: "x̂ = (x − μ_B) / √(σ²_B + ε),  y = γx̂ + β",
    where: [
      ["x̂", "normalized activation"],
      ["x", "an activation value"],
      ["μ_B", "mean of this feature over the mini-batch B"],
      ["σ²_B", "variance of this feature over the mini-batch B"],
      ["ε", "tiny constant to avoid dividing by zero"],
      ["γ", "learned scale"],
      ["β", "learned shift"],
      ["y", "the output"],
    ],
    related: ["layer-normalization", "batch-size", "cnn"],
  },
  {
    id: "encoder-decoder",
    term: "Encoder-Decoder",
    aliases: ["seq2seq", "sequence-to-sequence", "encoder", "decoder", "decoder-only", "encoder-only"],
    tags: ["architecture"],
    short: "An encoder reads the input into representations; a decoder generates output conditioned on them.",
    definition:
      "Encoder-decoder models (original Transformer, T5) suit translation and summarisation: the encoder sees the whole input bidirectionally, the decoder generates autoregressively and uses cross-attention into the encoder output. Encoder-only models (BERT) produce embeddings/classifications. Decoder-only models (GPT, LLaMA, Claude) drop the encoder and treat everything as one sequence to continue.",
    related: ["transformer", "autoregressive", "attention"],
  },
  {
    id: "cnn",
    term: "Convolutional Neural Network",
    aliases: ["CNN", "ConvNet", "convolution", "convolutional layer"],
    tags: ["architecture", "vision"],
    short: "Network that slides small learned filters over a grid (e.g. an image) to detect local patterns.",
    definition:
      "A convolution applies the same small kernel (e.g. 3×3) at every location, so the network has few parameters and is translation-equivariant: a cat detector works anywhere in the image. Stacking layers builds up from edges to textures to objects. Dominated computer vision before Vision Transformers (ViT).",
    formula: "(I * K)(i, j) = Σₘ Σₙ I(i+m, j+n) · K(m, n)",
    where: [
      ["I", "input image (a grid of numbers)"],
      ["K", "kernel / filter (a small grid of learned weights)"],
      ["*", "convolution (not multiplication)"],
      ["i, j", "output pixel position"],
      ["m, n", "offsets within the kernel"],
    ],
    js: `function conv2d(img, k) {
  const out = [];
  for (let i = 0; i + k.length <= img.length; i++) {
    out.push([]);
    for (let j = 0; j + k[0].length <= img[0].length; j++) {
      let s = 0;
      for (let m = 0; m < k.length; m++)
        for (let n = 0; n < k[0].length; n++) s += img[i + m][j + n] * k[m][n];
      out[i].push(s);
    }
  }
  return out;
}`,
    related: ["feed-forward-network", "batch-normalization"],
  },
  {
    id: "rnn",
    term: "Recurrent Neural Network",
    aliases: ["RNN", "recurrent network"],
    tags: ["architecture", "sequence"],
    short: "Processes a sequence one step at a time, carrying a hidden state forward like a reducer.",
    definition:
      "An RNN applies the same function at every step: h_t = f(h_{t−1}, x_t). This is literally Array.prototype.reduce with a learned reducer. RNNs are inherently sequential (slow to train on GPUs) and struggle with long-range dependencies due to vanishing gradients, which is why transformers largely replaced them. State-space models (Mamba) revive the idea with better parallelism.",
    formula: "hₜ = tanh(W_h hₜ₋₁ + W_x xₜ + b)",
    where: [
      ["hₜ", "hidden state at step t (the RNN's memory)"],
      ["hₜ₋₁", "hidden state from the previous step"],
      ["xₜ", "input at step t"],
      ["W_h", "weights applied to the previous state"],
      ["W_x", "weights applied to the input"],
      ["b", "bias vector"],
      ["tanh", "squashes values into (−1, 1)"],
    ],
    js: `const finalState = inputs.reduce(
  (h, x) => add(matvec(Wh, h), matvec(Wx, x)).map(Math.tanh),
  zeros(hiddenSize));`,
    related: ["lstm", "vanishing-gradient", "transformer", "tanh"],
  },
  {
    id: "lstm",
    term: "Long Short-Term Memory",
    aliases: ["LSTM", "GRU", "gated recurrent unit"],
    tags: ["architecture", "sequence"],
    short: "An RNN with gates that decide what to remember, forget and output, easing long-range learning.",
    definition:
      "LSTMs (Hochreiter & Schmidhuber, 1997) add a cell state and three sigmoid gates (forget, input, output). The additive cell update gives gradients an easier path back through time. GRUs are a simpler two-gate variant. Both were the standard for sequence modelling before transformers.",
    related: ["rnn", "sigmoid", "vanishing-gradient"],
  },
  {
    id: "gan",
    term: "Generative Adversarial Network",
    aliases: ["GAN", "GANs", "generator", "discriminator"],
    tags: ["architecture", "generative"],
    short: "Two networks trained against each other: a generator makes fakes, a discriminator spots them.",
    definition:
      "The generator maps random noise to samples; the discriminator outputs the probability a sample is real. They play a minimax game until the generator's samples are indistinguishable from real data. GANs produce sharp images but are notoriously unstable to train (mode collapse). Largely superseded by diffusion models for image generation.",
    formula: "min_G max_D 𝔼[log D(x)] + 𝔼[log(1 − D(G(z)))]",
    where: [
      ["G", "generator network: turns noise into fake samples"],
      ["D", "discriminator: outputs probability its input is real"],
      ["min_G max_D", "G minimizes while D maximizes the same objective (a game)"],
      ["x", "a real data sample"],
      ["z", "random noise input to the generator"],
      ["D(x)", "discriminator's belief that real x is real"],
      ["D(G(z))", "discriminator's belief that a fake is real"],
    ],
    related: ["diffusion-model", "vae", "latent-space"],
  },
  {
    id: "vae",
    term: "Variational Autoencoder",
    aliases: ["VAE", "autoencoder", "ELBO", "evidence lower bound"],
    tags: ["architecture", "generative"],
    short: "Encodes inputs to a probability distribution in latent space and decodes samples back.",
    definition:
      "An autoencoder compresses input to a small latent vector and reconstructs it. A VAE makes the latent a distribution (usually Gaussian) and trains with the ELBO: reconstruction quality minus a KL-divergence penalty that keeps latents close to a standard normal. That regularity lets you sample new latents and decode them. Stable Diffusion runs diffusion inside a VAE's latent space.",
    formula: "ELBO = 𝔼_q[log p(x|z)] − KL(q(z|x) ‖ p(z))",
    where: [
      ["ELBO", "evidence lower bound: the quantity a VAE maximizes"],
      ["x", "a data example"],
      ["z", "latent code"],
      ["q(z|x)", "encoder: distribution over latents given the input"],
      ["p(x|z)", "decoder: likelihood of reconstructing x from z"],
      ["p(z)", "prior over latents, usually 𝒩(0, I)"],
      ["𝔼_q", "average over latents sampled from the encoder q"],
    ],
    related: ["latent-space", "kl-divergence", "gaussian", "diffusion-model"],
  },
  {
    id: "diffusion-model",
    term: "Diffusion Model",
    aliases: ["diffusion", "DDPM", "denoising diffusion", "score-based model"],
    tags: ["architecture", "generative"],
    short: "Generates data by learning to reverse a gradual noising process.",
    definition:
      "Training: take real data, add Gaussian noise over many steps until it is pure noise, and train a network to predict the noise at each step. Generation: start from random noise and repeatedly denoise. Powers Stable Diffusion, DALL·E 3, Midjourney and many video models. Guidance (e.g. classifier-free guidance) steers samples toward a text prompt.",
    formula: "xₜ = √ᾱₜ x₀ + √(1 − ᾱₜ) ε,   ε ~ 𝒩(0, I)",
    where: [
      ["xₜ", "the noised sample at step t"],
      ["x₀", "the original clean data"],
      ["ᾱₜ", "\"alpha-bar\": fraction of signal left at step t (shrinks toward 0)"],
      ["ε", "the Gaussian noise that was added"],
      ["I", "identity matrix: independent noise in every dimension"],
    ],
    related: ["gaussian", "vae", "gan", "latent-space"],
  },
  {
    id: "mixture-of-experts",
    term: "Mixture of Experts",
    aliases: ["MoE", "sparse MoE", "experts", "router", "gating network"],
    tags: ["architecture", "llm", "performance"],
    short: "Many expert sub-networks with a router that activates only a few per token.",
    definition:
      "An MoE layer replaces one FFN with N experts plus a small router that picks the top-k (often 2) for each token. Total parameter count is huge, but compute per token stays small because most experts sit idle — \"sparse activation\". Used in Mixtral, DeepSeek-V3 and (reportedly) GPT-4. Load-balancing losses keep the router from overusing a few experts.",
    js: `function moe(x, experts, router, k = 2) {
  const gate = softmax(matvec(router, x));
  const top = gate.map((g, i) => [g, i]).sort((a, b) => b[0] - a[0]).slice(0, k);
  return top.reduce((acc, [g, i]) => add(acc, scale(experts[i](x), g)), zeros(x.length));
}`,
    related: ["feed-forward-network", "parameters", "sparse", "softmax"],
  },

  // ── Text, tokens and embeddings ──────────────────────────────────────────
  {
    id: "token",
    term: "Token",
    aliases: ["tokens", "subword"],
    tags: ["llm", "nlp"],
    short: "The unit of text a language model reads and writes — usually a word piece.",
    definition:
      "Models don't see characters or words; they see integer IDs from a fixed vocabulary of ~30k–200k tokens. Common words are a single token, rare words split into several (\"tokenization\" → \"token\" + \"ization\"). In English one token averages roughly ¾ of a word. Context limits, pricing and speed are all measured in tokens.",
    js: `// e.g. "Hello world!" -> [9906, 1917, 0]  (IDs depend on the tokenizer)
const ids = tokenizer.encode("Hello world!");
const text = tokenizer.decode(ids);`,
    related: ["tokenization", "embedding", "context-window"],
  },
  {
    id: "tokenization",
    term: "Tokenization",
    aliases: ["tokenizer", "BPE", "byte-pair encoding", "SentencePiece", "WordPiece"],
    tags: ["llm", "nlp"],
    short: "Splitting text into tokens from a learned vocabulary.",
    definition:
      "Byte-Pair Encoding (BPE) starts with single bytes and repeatedly merges the most frequent adjacent pair into a new vocabulary entry until it reaches the target size. Encoding then greedily applies those merges. WordPiece and SentencePiece/Unigram are alternatives. Tokenizer quirks explain many LLM oddities, e.g. trouble counting letters in a word.",
    js: `// One BPE training step: find the most frequent adjacent pair
const counts = new Map();
for (let i = 0; i < ids.length - 1; i++) {
  const key = ids[i] + "," + ids[i + 1];
  counts.set(key, (counts.get(key) ?? 0) + 1);
}
const best = [...counts].sort((a, b) => b[1] - a[1])[0][0];`,
    related: ["token", "embedding"],
  },
  {
    id: "embedding",
    term: "Embedding",
    aliases: ["embeddings", "embedding vector", "word embedding", "vector embedding", "word2vec"],
    tags: ["representation", "nlp"],
    short: "A dense vector of numbers representing an item (token, sentence, image) so similar items are close together.",
    definition:
      "Inside a model, the embedding layer is just a lookup table: row i of a [vocabSize × d] matrix is the vector for token i. Separately, \"embedding models\" map whole texts to a single vector used for semantic search, clustering and RAG — compare them with cosine similarity. Directions in embedding space often carry meaning (king − man + woman ≈ queen).",
    js: `const embeddingTable = /* [vocabSize][d] learned weights */ [];
const embed = ids => ids.map(id => embeddingTable[id]);

// Semantic search with an embedding model
const score = cosineSimilarity(await embedText(query), await embedText(doc));`,
    related: ["token", "latent-space", "cosine-similarity", "vector-database", "rag"],
  },
  {
    id: "latent-space",
    term: "Latent Space",
    aliases: ["latent representation", "latent vector", "latents", "hidden representation", "representation space"],
    tags: ["representation"],
    short: "The internal vector space where a model represents data in compressed, meaningful form.",
    definition:
      "\"Latent\" means hidden: not directly observed. A model's hidden activations or an encoder's output live in a latent space where nearby points represent similar things and directions can correspond to features (smiling, plural, sentiment). Generative models sample or interpolate in latent space, then decode.",
    related: ["embedding", "vae", "manifold", "interpolation"],
  },
  {
    id: "logits",
    term: "Logits",
    aliases: ["logit", "raw scores", "unnormalized scores"],
    tags: ["llm", "output"],
    short: "The raw, unnormalised scores a model outputs before softmax turns them into probabilities.",
    definition:
      "An LLM's final layer outputs one logit per vocabulary token. Logits can be any real number; only their differences matter. Softmax converts them to probabilities. (Strictly, a logit is the log-odds log(p/(1−p)), the inverse of sigmoid, but in ML the word is used loosely for any pre-softmax score.)",
    formula: "p = softmax(logits)",
    where: [
      ["p", "output probabilities"],
      ["logits", "raw scores from the model's last layer"],
      ["softmax", "converts scores into probabilities"],
    ],
    js: `const logits = [2.0, 1.0, 0.1];
const probs = softmax(logits); // [0.659, 0.242, 0.099]`,
    related: ["softmax", "temperature", "sigmoid", "cross-entropy"],
  },
  {
    id: "temperature",
    term: "Temperature",
    aliases: ["sampling temperature", "softmax temperature"],
    tags: ["sampling", "llm", "inference"],
    short: "Divides logits before softmax: low = more deterministic, high = more random.",
    definition:
      "T < 1 sharpens the distribution toward the top token; T → 0 approaches greedy decoding. T > 1 flattens it, making unlikely tokens more probable and output more creative (and error-prone). T = 1 leaves the model's distribution unchanged. Also used in distillation and contrastive learning to soften targets.",
    formula: "pᵢ = exp(zᵢ / T) / Σⱼ exp(zⱼ / T)",
    where: [
      ["pᵢ", "probability of token i"],
      ["zᵢ", "logit (raw score) of token i"],
      ["zⱼ", "logit of token j, summed over every token"],
      ["T", "temperature: < 1 sharper, > 1 flatter"],
    ],
    js: `const withTemperature = (logits, T) => softmax(logits.map(z => z / T));`,
    related: ["softmax", "logits", "top-p-sampling", "greedy-decoding"],
  },
  {
    id: "top-k-sampling",
    term: "Top-k Sampling",
    aliases: ["top k", "top-k"],
    tags: ["sampling", "inference"],
    short: "Sample the next token from only the k most likely candidates.",
    definition:
      "Zero out every token outside the k highest-probability ones, renormalise, and sample. Cuts off the long tail of nonsense tokens, but a fixed k is too restrictive when many tokens are plausible and too loose when one is clearly right — which motivated top-p.",
    js: `function topK(probs, k) {
  const keep = new Set(probs.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).slice(0, k).map(([, i]) => i));
  const masked = probs.map((p, i) => (keep.has(i) ? p : 0));
  const total = masked.reduce((a, b) => a + b, 0);
  return masked.map(p => p / total);
}`,
    related: ["top-p-sampling", "temperature", "greedy-decoding"],
  },
  {
    id: "top-p-sampling",
    term: "Top-p Sampling",
    aliases: ["nucleus sampling", "top p", "top-p"],
    tags: ["sampling", "inference"],
    short: "Sample from the smallest set of tokens whose probabilities add up to at least p.",
    definition:
      "Sort tokens by probability and keep adding them until the cumulative sum reaches p (e.g. 0.9); sample from that \"nucleus\". The candidate set adapts: small when the model is confident, large when it isn't (Holtzman et al., 2019).",
    js: `function topP(probs, p) {
  const sorted = probs.map((pr, i) => [pr, i]).sort((a, b) => b[0] - a[0]);
  const keep = new Set(); let cum = 0;
  for (const [pr, i] of sorted) { keep.add(i); cum += pr; if (cum >= p) break; }
  return probs.map((pr, i) => (keep.has(i) ? pr / cum : 0));
}`,
    related: ["top-k-sampling", "temperature"],
  },
  {
    id: "greedy-decoding",
    term: "Greedy Decoding",
    aliases: ["greedy search", "argmax decoding"],
    tags: ["sampling", "inference"],
    short: "Always pick the single most probable next token.",
    definition:
      "Deterministic and fast, but tends to produce repetitive, bland text and can miss sequences that are better overall because each step is locally optimal. Equivalent to temperature → 0.",
    js: `const nextToken = argmax(logits);`,
    related: ["argmax", "beam-search", "temperature"],
  },
  {
    id: "beam-search",
    term: "Beam Search",
    aliases: ["beam width", "beam"],
    tags: ["sampling", "inference"],
    short: "Keeps the B best partial sequences at each step instead of just one.",
    definition:
      "At each step every beam is extended with candidate tokens, all extensions are scored by total log-probability, and the top B (beam width) survive. Finds higher-likelihood outputs than greedy decoding; popular for translation and speech, less so for open-ended chat where it produces dull text.",
    related: ["greedy-decoding", "autoregressive"],
  },
  {
    id: "speculative-decoding",
    term: "Speculative Decoding",
    aliases: ["speculative sampling", "draft model", "assisted generation"],
    tags: ["inference", "performance", "llm"],
    short: "A small draft model guesses several tokens; the big model verifies them all in one pass.",
    definition:
      "LLM generation is memory-bound, so checking k tokens in one forward pass costs about the same as generating one. A cheap draft model proposes k tokens, the target model scores them in parallel, and a rejection-sampling rule accepts the longest correct prefix. Output distribution is identical to the big model alone, typically 2–3× faster.",
    related: ["autoregressive", "inference", "distillation"],
  },
  {
    id: "autoregressive",
    term: "Autoregressive",
    aliases: ["autoregressive model", "AR model", "next-token prediction", "causal language model", "causal LM"],
    tags: ["llm", "generative"],
    short: "Generates a sequence one element at a time, each conditioned on all previous ones.",
    definition:
      "An autoregressive model factorises the probability of a sequence with the chain rule of probability: p(x) = Π p(xₜ | x<ₜ). GPT-style LLMs are trained on next-token prediction and generate by appending their own outputs to the input in a loop.",
    formula: "p(x₁…x_n) = Π_t p(xₜ | x₁…xₜ₋₁)",
    where: [
      ["p(x₁…x_n)", "probability of the whole sequence of n items"],
      ["p", "probability under the model"],
      ["xₜ", "the item at position t"],
      ["x₁…xₜ₋₁", "everything generated before position t"],
      ["Π_t", "product over positions t"],
    ],
    js: `let ids = tokenizer.encode(prompt);
while (ids.length < maxLen) {
  const next = sample(model(ids).at(-1));  // logits for last position
  if (next === EOS) break;
  ids.push(next);
}`,
    related: ["causal-mask", "kv-cache", "conditional-probability", "token"],
  },
  {
    id: "context-window",
    term: "Context Window",
    aliases: ["context length", "context size", "sequence length", "max tokens"],
    tags: ["llm"],
    short: "The maximum number of tokens a model can consider at once (prompt + output).",
    definition:
      "Everything the model \"knows\" about the current conversation must fit in the context window. Ranges from 2k tokens (early GPT) to 1M+ in modern models. Attention cost grows quadratically with length and KV-cache memory linearly, so long contexts are expensive. Models may also use information in the middle of long contexts less reliably (\"lost in the middle\").",
    related: ["token", "kv-cache", "rope", "rag"],
  },
  {
    id: "perplexity",
    term: "Perplexity",
    aliases: ["PPL"],
    tags: ["evaluation", "llm"],
    short: "How \"surprised\" a language model is by text; lower is better.",
    definition:
      "Perplexity is the exponential of the average negative log-likelihood per token. A perplexity of 10 means the model is, on average, as uncertain as if choosing uniformly among 10 tokens. Useful for comparing models on the same tokenizer and data; not directly comparable across tokenizers.",
    formula: "PPL = exp(−(1/N) Σ log p(xᵢ | x<ᵢ))",
    where: [
      ["PPL", "perplexity"],
      ["N", "number of tokens"],
      ["xᵢ", "the i-th token"],
      ["x<ᵢ", "all tokens before i"],
      ["p(xᵢ | x<ᵢ)", "model's probability for the actual next token"],
    ],
    js: `const perplexity = tokenProbs =>
  Math.exp(-tokenProbs.reduce((s, p) => s + Math.log(p), 0) / tokenProbs.length);`,
    related: ["cross-entropy", "likelihood", "entropy"],
  },

  // ── Training ─────────────────────────────────────────────────────────────
  {
    id: "loss-function",
    term: "Loss Function",
    aliases: ["loss", "cost function", "objective function", "objective", "training loss"],
    tags: ["training"],
    short: "A single number measuring how wrong the model's predictions are; training minimises it.",
    definition:
      "The loss compares predictions to targets: mean squared error for regression, cross-entropy for classification and language modelling. Training repeatedly computes the loss, its gradient with respect to every parameter, and nudges parameters downhill. \"Objective\" is the general term (you may maximise a reward instead of minimising a loss).",
    formula: "MSE = (1/n) Σ (ŷᵢ − yᵢ)²",
    where: [
      ["MSE", "mean squared error"],
      ["n", "number of examples"],
      ["ŷᵢ", "model's prediction for example i"],
      ["yᵢ", "true target for example i"],
    ],
    js: `const mse = (pred, target) =>
  pred.reduce((s, p, i) => s + (p - target[i]) ** 2, 0) / pred.length;`,
    related: ["cross-entropy", "gradient-descent", "backpropagation", "regularization"],
  },
  {
    id: "gradient-descent",
    term: "Gradient Descent",
    aliases: ["steepest descent", "optimizer", "optimization"],
    tags: ["training", "optimization"],
    short: "Minimise a function by repeatedly stepping opposite its gradient.",
    definition:
      "The gradient points uphill, so subtracting a small multiple of it (the learning rate η) lowers the loss. Repeat until it stops improving. Full-batch gradient descent uses the entire dataset per step; in practice deep learning uses stochastic or mini-batch variants (SGD, Adam).",
    formula: "θ ← θ − η ∇_θ L(θ)",
    where: [
      ["θ", "all model parameters"],
      ["η", "learning rate (step size)"],
      ["∇_θ L(θ)", "gradient of the loss L with respect to the parameters"],
      ["L", "loss function"],
    ],
    js: `for (let step = 0; step < steps; step++) {
  const g = grad(loss, params);
  params = params.map((p, i) => p - lr * g[i]);
}`,
    related: ["gradient", "learning-rate", "sgd", "adam", "loss-function", "convexity"],
  },
  {
    id: "sgd",
    term: "Stochastic Gradient Descent",
    aliases: ["SGD", "mini-batch gradient descent", "momentum"],
    tags: ["training", "optimization"],
    short: "Gradient descent using a small random batch of data per step instead of the whole dataset.",
    definition:
      "Each mini-batch gives a noisy but cheap estimate of the true gradient. The noise even helps escape poor regions. Momentum adds a running average of past gradients (like a ball rolling downhill) to smooth updates and speed progress along consistent directions.",
    formula: "v ← βv + ∇L_batch(θ)\nθ ← θ − ηv",
    where: [
      ["v", "velocity: running average of gradients (momentum)"],
      ["β", "momentum coefficient, e.g. 0.9"],
      ["∇L_batch(θ)", "gradient of the loss on the current mini-batch"],
      ["θ", "model parameters"],
      ["η", "learning rate"],
    ],
    js: `v = v.map((vi, i) => beta * vi + g[i]);
params = params.map((p, i) => p - lr * v[i]);`,
    related: ["gradient-descent", "adam", "batch-size", "stochastic"],
  },
  {
    id: "adam",
    term: "Adam",
    aliases: ["Adam optimizer", "AdamW"],
    tags: ["training", "optimization"],
    short: "The default deep-learning optimizer: momentum plus a per-parameter adaptive learning rate.",
    definition:
      "Adam (Kingma & Ba, 2014) tracks a running mean of gradients (m, momentum) and of squared gradients (v), and divides the step by √v so parameters with large, noisy gradients take smaller steps. Bias correction fixes the zero initialisation of m and v. AdamW decouples weight decay from the gradient update and is the standard for training transformers.",
    formula: "m ← β₁m + (1−β₁)g\nv ← β₂v + (1−β₂)g²\nθ ← θ − η · m̂ / (√v̂ + ε)",
    where: [
      ["m", "first moment: running average of gradients"],
      ["v", "second moment: running average of squared gradients"],
      ["g", "current gradient"],
      ["β₁", "decay rate for m, usually 0.9"],
      ["β₂", "decay rate for v, usually 0.999"],
      ["m̂, v̂", "bias-corrected m and v (the hat marks a corrected estimate)"],
      ["θ", "model parameters"],
      ["η", "learning rate"],
      ["ε", "tiny constant to avoid dividing by zero"],
    ],
    js: `function adamStep(p, g, s, t, { lr = 1e-3, b1 = 0.9, b2 = 0.999, eps = 1e-8 } = {}) {
  s.m = s.m.map((m, i) => b1 * m + (1 - b1) * g[i]);
  s.v = s.v.map((v, i) => b2 * v + (1 - b2) * g[i] ** 2);
  return p.map((pi, i) => {
    const mHat = s.m[i] / (1 - b1 ** t), vHat = s.v[i] / (1 - b2 ** t);
    return pi - lr * mHat / (Math.sqrt(vHat) + eps);
  });
}`,
    related: ["sgd", "learning-rate", "weight-decay", "gradient-descent"],
  },
  {
    id: "learning-rate",
    term: "Learning Rate",
    aliases: ["LR", "step size", "learning rate schedule", "cosine schedule", "lr schedule"],
    tags: ["training", "hyperparameter"],
    short: "How big a step the optimizer takes each update — the most important hyperparameter.",
    definition:
      "Too high and training diverges (loss explodes to NaN); too low and it crawls or gets stuck. Usually written η or α. Most training runs use a schedule: linear warmup, then cosine or linear decay toward zero.",
    formula: "θ ← θ − η ∇L",
    where: [
      ["θ", "model parameters"],
      ["η", "the learning rate"],
      ["∇L", "gradient of the loss"],
    ],
    js: `// Cosine decay after warmup
const lrAt = (step, total, maxLr, warm) =>
  step < warm ? maxLr * step / warm
              : 0.5 * maxLr * (1 + Math.cos(Math.PI * (step - warm) / (total - warm)));`,
    related: ["warmup", "gradient-descent", "hyperparameter", "adam"],
  },
  {
    id: "warmup",
    term: "Learning Rate Warmup",
    aliases: ["warmup", "warm-up", "linear warmup"],
    tags: ["training"],
    short: "Start with a tiny learning rate and ramp up over the first steps of training.",
    definition:
      "Early on, weights are random and optimizer statistics (e.g. Adam's v) are unreliable, so large steps can destabilise training. Linearly increasing the learning rate over the first few hundred or thousand steps avoids this, and is standard for transformers.",
    related: ["learning-rate", "adam"],
  },
  {
    id: "backpropagation",
    term: "Backpropagation",
    aliases: ["backprop", "backward pass", "reverse-mode autodiff", "automatic differentiation", "autodiff", "autograd"],
    tags: ["training"],
    short: "Computes the gradient of the loss for every parameter by applying the chain rule backward through the network.",
    definition:
      "The forward pass computes outputs and caches intermediate values. The backward pass walks the computation graph in reverse, multiplying local derivatives (chain rule) to get ∂L/∂θ for every parameter in roughly the cost of one more forward pass. Frameworks (PyTorch, JAX, TensorFlow.js) do this automatically — \"autograd\".",
    formula: "∂L/∂x = ∂L/∂y · ∂y/∂x",
    where: [
      ["L", "the loss"],
      ["x", "an earlier value in the network"],
      ["y", "a later value that depends on x"],
      ["∂L/∂y", "gradient arriving from later layers"],
      ["∂y/∂x", "local derivative of this operation"],
    ],
    js: `// Micro-autograd: y = a * b, then backprop
const a = { v: 2, g: 0 }, b = { v: 3, g: 0 };
const y = { v: a.v * b.v, g: 1 };   // dL/dy = 1
a.g += y.g * b.v;                  // dy/da = b  -> 3
b.g += y.g * a.v;                  // dy/db = a  -> 2`,
    related: ["chain-rule", "gradient", "gradient-descent", "vanishing-gradient"],
  },
  {
    id: "vanishing-gradient",
    term: "Vanishing Gradient",
    aliases: ["vanishing gradients", "exploding gradient", "exploding gradients"],
    tags: ["training"],
    short: "Gradients shrink (or blow up) exponentially as they pass back through many layers.",
    definition:
      "Backprop multiplies many local derivatives together. If they're mostly < 1 (e.g. saturated sigmoids) the product goes to ~0 and early layers stop learning; if > 1 it explodes. Fixes include ReLU-family activations, residual connections, normalization, careful initialisation, and gradient clipping for the exploding case.",
    js: `// 50 layers each scaling the gradient by 0.5
0.5 ** 50; // 8.9e-16  -> effectively zero`,
    related: ["backpropagation", "residual-connection", "gradient-clipping", "relu", "sigmoid"],
  },
  {
    id: "gradient-clipping",
    term: "Gradient Clipping",
    aliases: ["clip grad norm", "grad clipping"],
    tags: ["training"],
    short: "Caps the gradient's norm to prevent huge, destabilising updates.",
    definition:
      "If ‖g‖ exceeds a threshold c, rescale g to have norm exactly c (direction is preserved). A cheap safety net against exploding gradients and loss spikes; common values are 0.5–1.0.",
    formula: "g ← g · min(1, c / ‖g‖)",
    where: [
      ["g", "the gradient vector"],
      ["c", "maximum allowed norm (clip threshold)"],
      ["‖g‖", "length (L2 norm) of the gradient"],
    ],
    js: `const n = Math.hypot(...g);
if (n > maxNorm) g = g.map(x => x * maxNorm / n);`,
    related: ["vanishing-gradient", "norm"],
  },
  {
    id: "epoch",
    term: "Epoch",
    aliases: ["epochs", "training step", "iteration", "steps"],
    tags: ["training"],
    short: "One full pass over the training dataset.",
    definition:
      "A step (iteration) processes one mini-batch; an epoch is dataset_size / batch_size steps. Classic models train for many epochs; LLMs are often trained for about one epoch over trillions of tokens because data is plentiful and repeating it risks memorisation.",
    js: `for (let epoch = 0; epoch < numEpochs; epoch++)
  for (const batch of chunk(shuffle(data), batchSize))
    params = step(params, batch);`,
    related: ["batch-size", "overfitting"],
  },
  {
    id: "batch-size",
    term: "Batch Size",
    aliases: ["mini-batch", "minibatch", "batch"],
    tags: ["training", "hyperparameter"],
    short: "How many examples are processed together in one training step.",
    definition:
      "Larger batches give smoother gradient estimates and better hardware utilisation but need more memory, and beyond a point give diminishing returns. Gradient accumulation simulates a large batch by summing gradients over several small ones before updating. LLM papers often quote batch size in tokens (e.g. 4M tokens).",
    related: ["epoch", "sgd", "batch-normalization"],
  },
  {
    id: "hyperparameter",
    term: "Hyperparameter",
    aliases: ["hyperparameters", "hparams", "hyperparameter tuning"],
    tags: ["training"],
    short: "A setting chosen by you, not learned by the model (learning rate, batch size, layer count…).",
    definition:
      "Parameters are the weights learned by gradient descent; hyperparameters configure the learning process and architecture. They're picked by experiment: grid search, random search, or Bayesian optimisation, judged on a validation set.",
    related: ["parameters", "learning-rate", "batch-size", "ablation"],
  },
  {
    id: "overfitting",
    term: "Overfitting",
    aliases: ["overfit", "underfitting", "generalization", "memorization", "train/test split", "validation set"],
    tags: ["training", "evaluation"],
    short: "The model memorises training data instead of learning patterns that generalise.",
    definition:
      "The signature is training loss still falling while validation loss rises. Underfitting is the opposite: the model is too simple to capture the pattern. Always hold out validation and test data the model never trains on. Remedies: more data, regularization, dropout, early stopping, smaller models.",
    related: ["regularization", "dropout", "weight-decay", "epoch"],
  },
  {
    id: "regularization",
    term: "Regularization",
    aliases: ["regularisation", "L2 regularization", "L1 regularization", "early stopping"],
    tags: ["training"],
    short: "Any technique that discourages overfitting, often by penalising model complexity.",
    definition:
      "L2 regularization adds λ‖θ‖² to the loss (pushing weights toward zero); L1 adds λ‖θ‖₁ (pushing many to exactly zero → sparsity). Dropout, data augmentation and early stopping are also regularizers.",
    formula: "L_total = L_data + λ ‖θ‖²",
    where: [
      ["L_total", "the loss actually minimized"],
      ["L_data", "the ordinary prediction loss"],
      ["λ", "regularization strength"],
      ["‖θ‖²", "squared L2 norm of the parameters: sum of squared weights"],
    ],
    js: `const l2 = params.reduce((s, w) => s + w * w, 0);
const total = dataLoss + lambda * l2;`,
    related: ["overfitting", "weight-decay", "dropout", "norm"],
  },
  {
    id: "dropout",
    term: "Dropout",
    aliases: ["dropout rate"],
    tags: ["training", "regularization"],
    short: "Randomly zeroes a fraction of activations during training to prevent co-dependence.",
    definition:
      "With rate p, each activation is set to 0 with probability p and the survivors are scaled by 1/(1−p) so the expected value is unchanged. Disabled at inference. Forces the network to learn redundant features; acts like training an ensemble of sub-networks.",
    js: `const dropout = (x, p, training) =>
  training ? x.map(v => (Math.random() < p ? 0 : v / (1 - p))) : x;`,
    related: ["regularization", "overfitting"],
  },
  {
    id: "weight-decay",
    term: "Weight Decay",
    aliases: ["decoupled weight decay"],
    tags: ["training", "regularization"],
    short: "Shrinks every weight slightly toward zero at each step.",
    definition:
      "Mathematically equivalent to L2 regularization for plain SGD, but not for adaptive optimizers like Adam — which is why AdamW applies the decay directly to weights (\"decoupled\") rather than through the gradient. Typical values: 0.01–0.1.",
    formula: "θ ← θ − η(∇L + λθ)",
    where: [
      ["θ", "model parameters"],
      ["η", "learning rate"],
      ["∇L", "gradient of the loss"],
      ["λ", "weight-decay coefficient"],
    ],
    js: `params = params.map((p, i) => p - lr * (g[i] + wd * p));`,
    related: ["regularization", "adam"],
  },
  {
    id: "teacher-forcing",
    term: "Teacher Forcing",
    aliases: [],
    tags: ["training", "sequence"],
    short: "During training, feed the true previous token as input rather than the model's own prediction.",
    definition:
      "Lets every position in a sequence be trained in parallel (with a causal mask) and avoids compounding errors early in training. The downside is \"exposure bias\": at inference the model must consume its own possibly-wrong outputs, which it never practised.",
    related: ["autoregressive", "causal-mask"],
  },
  {
    id: "activation-function",
    term: "Activation Function",
    aliases: ["activation", "nonlinearity", "non-linearity", "activations"],
    tags: ["architecture"],
    short: "A nonlinear function applied element-wise between layers; without it a deep network collapses to one linear map.",
    definition:
      "Stacking linear layers just gives another linear layer (W₂W₁x is still linear). Inserting a nonlinearity σ lets networks approximate essentially any function. Common choices: ReLU, GELU, SiLU/Swish, tanh, sigmoid. \"Activations\" also refers to the output values of a layer.",
    js: `const relu = x => Math.max(0, x);
const hidden = matvec(W1, x).map(relu);`,
    related: ["relu", "gelu", "sigmoid", "tanh", "feed-forward-network"],
  },
  {
    id: "relu",
    term: "ReLU",
    aliases: ["rectified linear unit", "Leaky ReLU"],
    tags: ["activation"],
    short: "max(0, x): passes positives through, zeroes negatives.",
    definition:
      "Cheap and doesn't saturate for positive inputs, which largely solved vanishing gradients in deep nets. Downside: units stuck in the negative region get zero gradient and can \"die\". Leaky ReLU uses a small slope (e.g. 0.01x) for negatives.",
    formula: "ReLU(x) = max(0, x)",
    where: [
      ["x", "input value"],
      ["ReLU", "rectified linear unit"],
    ],
    js: `const relu = x => Math.max(0, x);
const leakyRelu = (x, a = 0.01) => (x > 0 ? x : a * x);`,
    related: ["activation-function", "gelu", "vanishing-gradient"],
  },
  {
    id: "gelu",
    term: "GELU",
    aliases: ["Gaussian error linear unit", "SiLU", "Swish", "SwiGLU", "GLU"],
    tags: ["activation"],
    short: "A smooth ReLU-like activation used in most transformers.",
    definition:
      "GELU(x) = x·Φ(x), where Φ is the standard Gaussian CDF — it weights inputs by how likely they are to be positive. SiLU/Swish is x·sigmoid(x), very similar in shape. SwiGLU (LLaMA, PaLM) is a gated variant: Swish(xW) ⊙ (xV).",
    formula: "GELU(x) ≈ 0.5x(1 + tanh(√(2/π)(x + 0.044715x³)))",
    where: [
      ["x", "input value"],
      ["GELU", "Gaussian error linear unit"],
      ["π", "the constant 3.14159…"],
      ["0.5, 0.044715", "constants of the tanh approximation"],
      ["tanh", "hyperbolic tangent"],
    ],
    js: `const gelu = x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
const silu = x => x / (1 + Math.exp(-x));`,
    related: ["relu", "activation-function", "sigmoid", "gaussian"],
  },

  // ── Model lifecycle ──────────────────────────────────────────────────────
  {
    id: "parameters",
    term: "Parameters",
    aliases: ["weights", "model weights", "parameter count", "params", "biases", "7B", "70B"],
    tags: ["model"],
    short: "The learned numbers (weights and biases) inside a model.",
    definition:
      "A \"7B model\" has ~7 billion parameters. Memory to hold them = count × bytes per parameter: 7B in fp16 (2 bytes) ≈ 14 GB; in 4-bit ≈ 3.5 GB. Training needs several times more for gradients and optimizer state.",
    js: `const gbNeeded = (params, bits) => (params * bits) / 8 / 1e9;
gbNeeded(7e9, 16); // 14
gbNeeded(7e9, 4);  // 3.5`,
    related: ["quantization", "hyperparameter", "scaling-laws"],
  },
  {
    id: "flops",
    term: "FLOPs",
    aliases: ["FLOP", "FLOPS", "floating point operations", "compute", "petaflop-days"],
    tags: ["performance", "scaling"],
    short: "Count of floating-point operations — the standard measure of compute cost.",
    definition:
      "Careful: FLOPs (lowercase s, plural) is an amount of work; FLOPS or FLOP/s is a rate (hardware speed). A useful rule of thumb: training a transformer costs about 6 × parameters × training tokens FLOPs; a forward pass costs about 2 × parameters per token.",
    formula: "C_train ≈ 6 · N · D",
    where: [
      ["C_train", "total training compute in FLOPs"],
      ["N", "number of model parameters"],
      ["D", "number of training tokens"],
      ["6", "≈ 2 FLOPs per parameter per token forward, 4 backward"],
    ],
    js: `const trainFlops = (params, tokens) => 6 * params * tokens;
trainFlops(7e9, 2e12); // 8.4e22`,
    related: ["scaling-laws", "parameters", "big-o"],
  },
  {
    id: "scaling-laws",
    term: "Scaling Laws",
    aliases: ["Chinchilla scaling", "neural scaling laws", "compute-optimal", "Chinchilla"],
    tags: ["scaling", "research"],
    short: "Empirical power-law relationships between model size, data, compute and loss.",
    definition:
      "Kaplan et al. (2020) found loss falls predictably as a power law in parameters, data and compute. Hoffmann et al. (2022, \"Chinchilla\") showed many models were undertrained and that compute-optimal training uses roughly 20 tokens per parameter. Labs use scaling laws to predict a big run's performance from small runs.",
    formula: "L(N, D) ≈ E + A/N^α + B/D^β",
    where: [
      ["L(N, D)", "predicted loss"],
      ["N", "number of parameters"],
      ["D", "number of training tokens"],
      ["E", "irreducible loss (noise floor of the data)"],
      ["A, B", "fitted constants"],
      ["α, β", "fitted exponents"],
    ],
    related: ["parameters", "flops", "pretraining"],
  },
  {
    id: "pretraining",
    term: "Pretraining",
    aliases: ["pre-training", "pretrained model", "foundation model", "base model", "self-supervised learning"],
    tags: ["training", "llm"],
    short: "Initial large-scale training on raw data (e.g. next-token prediction on web text).",
    definition:
      "Pretraining is self-supervised: the labels come from the data itself (the next token), so trillions of tokens of unlabeled text can be used. The result is a \"base\" or \"foundation\" model that has broad knowledge but isn't yet a helpful assistant — that comes from fine-tuning and RLHF.",
    related: ["fine-tuning", "rlhf", "autoregressive", "scaling-laws"],
  },
  {
    id: "fine-tuning",
    term: "Fine-Tuning",
    aliases: ["finetuning", "fine tuning", "SFT", "supervised fine-tuning", "instruction tuning", "transfer learning"],
    tags: ["training", "llm"],
    short: "Continuing training of a pretrained model on a smaller, task-specific dataset.",
    definition:
      "Supervised fine-tuning (SFT) trains on curated (prompt, ideal response) pairs to teach format and behaviour. Instruction tuning is SFT across many tasks phrased as instructions. Full fine-tuning updates every weight; parameter-efficient methods (LoRA, adapters) update a tiny fraction.",
    related: ["pretraining", "lora", "rlhf", "distillation"],
  },
  {
    id: "lora",
    term: "LoRA",
    aliases: ["low-rank adaptation", "QLoRA", "PEFT", "parameter-efficient fine-tuning", "adapter", "adapters"],
    tags: ["training", "llm", "performance"],
    short: "Fine-tune by learning a small low-rank update to frozen weights.",
    definition:
      "Instead of updating a big d×d weight matrix W, LoRA freezes W and learns ΔW = BA where B is d×r and A is r×d with r tiny (e.g. 8). This cuts trainable parameters by 1000×+, and adapters can be swapped at serving time. QLoRA does this on top of a 4-bit quantized base model.",
    formula: "W' = W + (α/r) · BA,   B ∈ ℝ^{d×r}, A ∈ ℝ^{r×d}",
    where: [
      ["W'", "the adapted weight matrix used after fine-tuning"],
      ["W", "the original pretrained weights (frozen)"],
      ["B, A", "two small trainable matrices whose product BA is the update"],
      ["BA", "the low-rank update (a d×d matrix)"],
      ["α", "scaling hyperparameter"],
      ["r", "rank of the update, small (e.g. 8)"],
      ["d", "layer width (model dimension)"],
    ],
    js: `// Trainable params: full vs LoRA for a 4096x4096 layer
4096 * 4096;          // 16,777,216
2 * 4096 * 8;         // 65,536 with rank r = 8`,
    related: ["fine-tuning", "rank", "matrix-multiplication", "quantization"],
  },
  {
    id: "quantization",
    term: "Quantization",
    aliases: ["quantisation", "int8", "int4", "4-bit", "8-bit", "GGUF", "GPTQ", "AWQ", "fp16", "bf16", "fp8"],
    tags: ["inference", "performance"],
    short: "Storing weights (and/or activations) in fewer bits to save memory and speed up inference.",
    definition:
      "Weights are trained in 32/16-bit floats but can often be stored as 8- or 4-bit integers with a per-block scale factor, with modest quality loss. This is what lets large models run on laptops and phones (llama.cpp's GGUF, GPTQ, AWQ). bf16 is a 16-bit float format with fp32's range, standard for training.",
    formula: "q = round(w / s),   w ≈ q · s",
    where: [
      ["w", "original floating-point weight"],
      ["q", "quantized integer value"],
      ["s", "scale factor shared by a block of weights"],
      ["round", "round to the nearest integer"],
    ],
    js: `function quantizeInt8(w) {
  const s = Math.max(...w.map(Math.abs)) / 127;
  return { q: Int8Array.from(w, x => Math.round(x / s)), s };
}
const dequant = ({ q, s }) => Array.from(q, x => x * s);`,
    related: ["parameters", "inference", "lora", "distillation"],
  },
  {
    id: "distillation",
    term: "Knowledge Distillation",
    aliases: ["distillation", "distilled model", "teacher model", "student model", "teacher-student"],
    tags: ["training", "performance"],
    short: "Train a small \"student\" model to imitate a large \"teacher\" model.",
    definition:
      "The student learns from the teacher's full output distribution (soft targets, often softened with temperature) rather than just the correct label, which carries richer information (\"cat is a bit like dog, nothing like car\"). Produces smaller, faster models that keep much of the teacher's quality.",
    formula: "L = KL(softmax(z_T/τ) ‖ softmax(z_S/τ))",
    where: [
      ["L", "distillation loss"],
      ["z_T", "teacher model's logits"],
      ["z_S", "student model's logits"],
      ["τ", "temperature; higher softens both distributions"],
      ["softmax", "turns logits into probabilities"],
    ],
    related: ["kl-divergence", "temperature", "quantization", "fine-tuning"],
  },
  {
    id: "inference",
    term: "Inference",
    aliases: ["forward pass", "serving", "prediction", "test time", "test-time compute", "prefill", "decode"],
    tags: ["inference"],
    short: "Running a trained model to produce outputs (as opposed to training it).",
    definition:
      "For LLMs, inference has two phases: prefill (process the whole prompt in parallel, compute-bound) and decode (generate tokens one at a time, memory-bandwidth-bound). Latency metrics: time-to-first-token (TTFT) and tokens/sec. Note: in statistics \"inference\" means drawing conclusions from data — a different sense.",
    related: ["kv-cache", "quantization", "speculative-decoding", "autoregressive"],
  },

  // ── Alignment & RL ───────────────────────────────────────────────────────
  {
    id: "reinforcement-learning",
    term: "Reinforcement Learning",
    aliases: ["RL", "policy", "reward", "environment", "agent-environment loop", "Q-learning", "policy gradient"],
    tags: ["rl", "training"],
    short: "Learning by trial and error: an agent takes actions and adjusts to maximise reward.",
    definition:
      "The policy π(a|s) maps states to action probabilities. The agent acts in an environment, receives rewards, and updates the policy to maximise expected cumulative (discounted) reward. Policy-gradient methods directly push up the probability of actions that led to high reward. Used for games, robotics and LLM alignment (RLHF) and reasoning training.",
    formula: "J(π) = 𝔼_π[Σₜ γᵗ rₜ]",
    where: [
      ["J(π)", "expected total reward of policy π (what RL maximizes)"],
      ["π", "the policy: how the agent picks actions"],
      ["𝔼_π", "average over trajectories produced by following π"],
      ["rₜ", "reward received at step t"],
      ["γ", "discount factor (e.g. 0.99): future rewards count less"],
    ],
    js: `let state = env.reset();
while (!done) {
  const action = sample(policy(state));
  ({ state, reward, done } = env.step(action));
  trajectory.push({ state, action, reward });
}`,
    related: ["rlhf", "ppo", "reward-model", "markov-chain", "expected-value"],
  },
  {
    id: "rlhf",
    term: "RLHF",
    aliases: ["reinforcement learning from human feedback", "RLAIF", "RL from AI feedback", "preference tuning"],
    tags: ["alignment", "rl", "llm"],
    short: "Fine-tune an LLM with RL against a reward model trained on human preferences.",
    definition:
      "Three stages: (1) supervised fine-tune; (2) collect human comparisons of pairs of responses and train a reward model to predict which is preferred; (3) optimise the LLM with RL (typically PPO) to maximise that reward, with a KL penalty to stay close to the original model. RLAIF swaps human labels for AI-generated ones (e.g. Constitutional AI).",
    formula: "max_π 𝔼[r(x, y)] − β · KL(π ‖ π_ref)",
    where: [
      ["max_π", "choose the policy π that maximizes the expression"],
      ["π", "the language model being trained (the policy)"],
      ["π_ref", "the frozen starting model"],
      ["r(x, y)", "reward model's score for response y to prompt x"],
      ["β", "strength of the KL penalty"],
    ],
    related: ["reward-model", "ppo", "dpo", "alignment", "kl-divergence", "fine-tuning"],
  },
  {
    id: "reward-model",
    term: "Reward Model",
    aliases: ["RM", "preference model", "Bradley-Terry"],
    tags: ["alignment", "rl"],
    short: "A model that scores how good a response is, trained on human preference comparisons.",
    definition:
      "Given a prompt and two responses where humans preferred one, the reward model is trained so the preferred response gets the higher score, using the Bradley–Terry loss. It then serves as an automatic judge for RL. Policies can learn to exploit its blind spots (\"reward hacking\").",
    formula: "L = −log σ(r(x, y_w) − r(x, y_l))",
    where: [
      ["L", "training loss"],
      ["r", "the reward model's score"],
      ["x", "the prompt"],
      ["y_w", "the preferred (winning) response"],
      ["y_l", "the rejected (losing) response"],
      ["σ", "sigmoid: turns the score difference into a probability"],
    ],
    js: `const rmLoss = (rChosen, rRejected) => -Math.log(sigmoid(rChosen - rRejected));`,
    related: ["rlhf", "dpo", "sigmoid"],
  },
  {
    id: "ppo",
    term: "PPO",
    aliases: ["proximal policy optimization", "GRPO", "TRPO"],
    tags: ["rl", "optimization"],
    short: "A policy-gradient RL algorithm that clips updates so the policy can't change too much at once.",
    definition:
      "PPO (Schulman et al., 2017) computes the probability ratio between new and old policy for each action and clips it to [1−ε, 1+ε], preventing destructive large updates. Simple and robust, it became the default for RLHF. GRPO (DeepSeek) drops the value network and uses group-relative rewards instead.",
    formula: "L = 𝔼[min(ρA, clip(ρ, 1−ε, 1+ε)A)],  ρ = π_new / π_old",
    where: [
      ["L", "PPO objective"],
      ["ρ", "probability ratio of the action under the new vs old policy"],
      ["π_new", "updated policy"],
      ["π_old", "policy before this update"],
      ["A", "advantage: how much better the action was than expected"],
      ["ε", "clip range, e.g. 0.2"],
      ["clip(ρ, 1−ε, 1+ε)", "limit ρ to [1−ε, 1+ε] so updates stay small"],
    ],
    related: ["reinforcement-learning", "rlhf"],
  },
  {
    id: "dpo",
    term: "DPO",
    aliases: ["direct preference optimization"],
    tags: ["alignment", "training"],
    short: "Learns from preference pairs directly, without a separate reward model or RL loop.",
    definition:
      "Rafailov et al. (2023) showed the RLHF objective can be rewritten as a simple classification loss on (chosen, rejected) pairs, using the policy and a frozen reference model. Simpler and more stable than PPO-based RLHF; widely used for open models.",
    formula: "L = −log σ(β[log π(y_w)/π_ref(y_w) − log π(y_l)/π_ref(y_l)])",
    where: [
      ["L", "DPO loss"],
      ["π", "the model being trained"],
      ["π_ref", "frozen reference model"],
      ["y_w", "preferred response"],
      ["y_l", "rejected response"],
      ["β", "how strongly to deviate from the reference"],
      ["σ", "sigmoid function"],
    ],
    related: ["rlhf", "reward-model", "sigmoid"],
  },
  {
    id: "alignment",
    term: "Alignment",
    aliases: ["AI alignment", "AI safety", "constitutional AI", "red teaming", "jailbreak"],
    tags: ["alignment", "safety"],
    short: "Making AI systems do what their designers and users actually intend, safely.",
    definition:
      "Covers behavioural training (SFT, RLHF, constitutional AI), evaluation (red-teaming, jailbreak testing) and research into understanding model internals (interpretability). Common goals: helpful, honest and harmless.",
    related: ["rlhf", "dpo", "hallucination"],
  },

  // ── Using LLMs ───────────────────────────────────────────────────────────
  {
    id: "prompt",
    term: "Prompt",
    aliases: ["prompting", "prompt engineering", "system prompt", "instruction"],
    tags: ["llm", "usage"],
    short: "The input text given to a model to elicit a response.",
    definition:
      "Includes any system prompt (persistent instructions), the conversation so far, and the user's message. Prompt engineering is the practice of structuring this input — clear instructions, examples, context, output format — to get reliable results.",
    related: ["in-context-learning", "chain-of-thought", "context-window", "zero-shot"],
  },
  {
    id: "in-context-learning",
    term: "In-Context Learning",
    aliases: ["ICL", "few-shot", "few-shot learning", "few-shot prompting", "one-shot", "k-shot"],
    tags: ["llm", "usage"],
    short: "A model picks up a task from examples in the prompt, with no weight updates.",
    definition:
      "Popularised by the GPT-3 paper (\"Language Models are Few-Shot Learners\", 2020). Put a few input→output examples in the prompt and the model continues the pattern. \"k-shot\" means k examples were given. Nothing is learned permanently; it only lasts for that context.",
    js: `const prompt = \`Translate to French.
sea otter => loutre de mer
cheese => fromage
\${word} =>\`;`,
    related: ["zero-shot", "prompt", "context-window"],
  },
  {
    id: "zero-shot",
    term: "Zero-Shot",
    aliases: ["zero-shot learning", "zero-shot prompting", "zero shot"],
    tags: ["llm", "evaluation"],
    short: "Performing a task with only an instruction and no examples.",
    definition:
      "Zero-shot means the model got no task-specific examples (in the prompt or in training). Benchmarks often report zero-shot and few-shot scores separately.",
    related: ["in-context-learning", "prompt"],
  },
  {
    id: "chain-of-thought",
    term: "Chain-of-Thought",
    aliases: ["CoT", "chain of thought prompting", "reasoning", "step-by-step", "extended thinking", "reasoning model"],
    tags: ["llm", "reasoning"],
    short: "Having the model write out intermediate reasoning steps before the final answer.",
    definition:
      "Wei et al. (2022) showed that prompting for step-by-step reasoning greatly improves maths and logic performance: each generated token is extra computation the model can build on. Reasoning models are trained with RL to produce long internal chains of thought before answering (\"test-time compute\").",
    related: ["prompt", "in-context-learning", "inference"],
  },
  {
    id: "rag",
    term: "Retrieval-Augmented Generation",
    aliases: ["RAG", "retrieval augmented generation", "retrieval", "grounding"],
    tags: ["llm", "usage", "retrieval"],
    short: "Fetch relevant documents and put them in the prompt so the model answers from them.",
    definition:
      "Pipeline: chunk your documents, embed each chunk, store in a vector index. At query time, embed the question, retrieve the top-k most similar chunks (often combined with keyword/BM25 search and a reranker), and include them in the prompt. Reduces hallucination and lets models use private or fresh data without retraining.",
    js: `const qVec = await embed(question);
const top = chunks
  .map(c => ({ c, s: cosineSimilarity(qVec, c.vec) }))
  .sort((a, b) => b.s - a.s).slice(0, 5);
const answer = await llm(\`Context:\\n\${top.map(t => t.c.text).join("\\n---\\n")}\\n\\nQ: \${question}\`);`,
    related: ["embedding", "vector-database", "cosine-similarity", "hallucination", "context-window"],
  },
  {
    id: "vector-database",
    term: "Vector Database",
    aliases: ["vector store", "vector index", "ANN", "approximate nearest neighbor", "HNSW", "nearest neighbor search", "kNN"],
    tags: ["retrieval", "infrastructure"],
    short: "A store optimised for finding the vectors most similar to a query vector.",
    definition:
      "Brute-force similarity over millions of vectors is slow, so vector DBs use approximate nearest-neighbour (ANN) indexes like HNSW (a navigable graph) or IVF (clustering) to trade a little recall for huge speedups. Examples: pgvector, Pinecone, Qdrant, Weaviate, LanceDB.",
    js: `// Exact kNN (fine for a few thousand vectors)
const knn = (q, items, k) =>
  items.map(it => [cosineSimilarity(q, it.vec), it]).sort((a, b) => b[0] - a[0]).slice(0, k);`,
    related: ["embedding", "rag", "cosine-similarity", "euclidean-distance"],
  },
  {
    id: "hallucination",
    term: "Hallucination",
    aliases: ["hallucinations", "confabulation", "factuality"],
    tags: ["llm", "evaluation", "safety"],
    short: "When a model confidently states something false or unsupported.",
    definition:
      "LLMs generate plausible continuations, not verified facts, so they can invent citations, APIs or numbers. Mitigations: retrieval (RAG), asking for sources, tool use for calculations/lookups, lower temperature, and training models to express uncertainty or abstain.",
    related: ["rag", "alignment", "tool-use"],
  },
  {
    id: "agent",
    term: "AI Agent",
    aliases: ["agent", "agents", "agentic", "agentic workflow", "ReAct", "agent loop"],
    tags: ["llm", "usage"],
    short: "An LLM in a loop that decides on actions (tool calls), observes results, and continues toward a goal.",
    definition:
      "The model plans, calls tools (search, code execution, APIs), reads the results, and iterates until done. ReAct (Yao et al., 2022) interleaves reasoning and acting. In RL, \"agent\" more generally means whatever takes actions in an environment.",
    js: `const messages = [{ role: "user", content: task }];
for (;;) {
  const res = await llm(messages, { tools });
  messages.push(res);
  if (!res.toolCalls?.length) break;
  for (const call of res.toolCalls)
    messages.push({ role: "tool", id: call.id, content: await tools[call.name](call.args) });
}`,
    related: ["tool-use", "reinforcement-learning", "chain-of-thought"],
  },
  {
    id: "tool-use",
    term: "Tool Use",
    aliases: ["function calling", "tool calling", "tools", "MCP", "model context protocol"],
    tags: ["llm", "usage"],
    short: "The model emits a structured request to call an external function, then uses its result.",
    definition:
      "You describe tools with a name, description and JSON Schema for arguments. The model decides when to call one and outputs the arguments as JSON; your code executes it and returns the result. MCP (Model Context Protocol) standardises how tools and data sources are exposed to models.",
    js: `const tools = [{
  name: "get_weather",
  description: "Current weather for a city",
  input_schema: { type: "object", properties: { city: { type: "string" } }, required: ["city"] },
}];`,
    related: ["agent", "hallucination"],
  },

  // ── Research vocabulary ──────────────────────────────────────────────────
  {
    id: "contrastive-learning",
    term: "Contrastive Learning",
    aliases: ["contrastive loss", "InfoNCE", "CLIP", "SimCLR", "triplet loss"],
    tags: ["training", "representation"],
    short: "Learn embeddings by pulling matching pairs together and pushing non-matching pairs apart.",
    definition:
      "Given a positive pair (two views of the same image, an image and its caption) and many negatives, the InfoNCE loss is a softmax cross-entropy that asks the model to pick the true partner among the batch. CLIP trained image and text encoders this way, giving a shared embedding space for both.",
    formula: "L = −log [exp(sim(a, p)/τ) / Σₖ exp(sim(a, kₖ)/τ)]",
    where: [
      ["L", "InfoNCE loss"],
      ["a", "anchor example"],
      ["p", "its positive (matching) partner"],
      ["kₖ", "candidate k in the batch (the positive plus all negatives)"],
      ["sim", "similarity function, usually cosine similarity"],
      ["τ", "temperature"],
    ],
    related: ["embedding", "cosine-similarity", "softmax", "temperature"],
  },
  {
    id: "ablation",
    term: "Ablation Study",
    aliases: ["ablation", "ablations", "ablate"],
    tags: ["research", "evaluation"],
    short: "Removing or changing one component at a time to measure how much it contributes.",
    definition:
      "Like commenting out one feature and re-running your benchmarks. A paper's ablation table shows the effect of each design choice, e.g. \"without positional encoding, accuracy drops 4 points\".",
    related: ["hyperparameter", "sota"],
  },
  {
    id: "sota",
    term: "State of the Art",
    aliases: ["SOTA", "state-of-the-art", "baseline", "benchmark", "benchmarks", "leaderboard"],
    tags: ["research", "evaluation"],
    short: "The best published result on a benchmark at a given time.",
    definition:
      "Papers claim \"SOTA\" when they beat previous best results. A baseline is the simpler or prior method you compare against. Benchmarks (MMLU, GSM8K, HumanEval, SWE-bench, ImageNet) are fixed datasets with a metric; be aware of contamination, where test data leaked into training.",
    related: ["ablation", "ground-truth"],
  },
  {
    id: "ground-truth",
    term: "Ground Truth",
    aliases: ["label", "labels", "target", "targets", "gold label", "annotation"],
    tags: ["data", "evaluation"],
    short: "The correct answer for an example, against which predictions are compared.",
    definition:
      "In supervised learning each input x comes with a label y (the ground truth); the model predicts ŷ and the loss measures the gap. Labels usually come from human annotators, so they can be noisy.",
    related: ["loss-function", "one-hot"],
  },
];
