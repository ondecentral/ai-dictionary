# Attention Is All You Need (excerpt, paraphrased)

The dominant sequence transduction models are based on complex recurrent or
convolutional neural networks that include an encoder and a decoder. We propose
a new simple network architecture, the Transformer, based solely on attention
mechanisms, dispensing with recurrence and convolutions entirely.

We use multi-head attention with h = 8 parallel attention heads. Since our model
contains no recurrence, we add positional encodings to the input embeddings. The
output of the final layer is passed through a softmax to produce next-token
probabilities. We employ residual connections around each sub-layer, followed by
layer normalization, and apply dropout with rate 0.1.

We trained with the Adam optimizer (β₁ = 0.9, β₂ = 0.98, ε = 10⁻⁹), varying the
learning rate with a linear warmup over the first 4000 training steps. We use
label smoothing, which hurts perplexity but improves BLEU. Compared to RNNs and
LSTMs, self-attention layers have O(n²·d) complexity per layer. Our results are
state of the art; ablations show the importance of each component. The KL
divergence between distributions and the cross-entropy loss are reported. In
future work we will explore LoRA, RLHF and RAG with large language models.
