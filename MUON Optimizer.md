---
layout: default
title: Muon Optimizer
permalink: /muon-optimizer/
---
# Muon Optimizer

This guide derives Muon from the ground up, without assuming familiarity with Adam, adaptive methods, or matrix calculus beyond basics. All math is written so a motivated beginner can follow.

## Why Muon

- Classic optimizers treat parameters as unrelated scalars, but hidden-layer weights are matrices with rich geometry. **Muon** exploits this by computing a matrix-structured step that spreads learning across all directions, avoiding updates that collapse onto a few singular modes.
- The core idea: take the momentum matrix for a hidden layer and replace it with a near-orthogonal direction using a fast polynomial/Newton–Schulz procedure, then scale the step and apply weight decay.

## Notation

- A hidden linear layer: input $$x \in \mathbb{R}^{n}$$, weight $$W \in \mathbb{R}^{m \times n}$$, output $$y = W x$$.
- Loss at step $$t$$: $$\mathcal{L}_t$$, gradient $$G_t = \nabla_W \mathcal{L}_t(W_{t-1}) \in \mathbb{R}^{m \times n}$$.
- Momentum matrix: $$M_t$$.
- Spectral norm: $$\|A\|_2 = \sigma_{\max}(A)$$. Nuclear norm: $$\|A\|_* = \sum_i \sigma_i(A)$$.
- Inner product: $$\langle A, B \rangle = \operatorname{tr}(A^\top B)$$.

## From “output RMS control” to spectral-norm geometry

The change in output for a small weight perturbation $$\Delta W$$ is $$\Delta y = \Delta W\,x$$. If inputs are standardized so that $$\mathbb{E}\|x\|_2^2 = 1$$ (or bounded), then Jensen plus submultiplicativity gives the key bound:
$$
\mathbb{E}\|\Delta y\|_2^2 \;=\; \mathbb{E}\| \Delta W\,x \|_2^2 \;\le\; \|\Delta W\|_2^2 \,\mathbb{E}\|x\|_2^2 \;\approx\; \|\Delta W\|_2^2.
$$
Thus, constraining the spectral norm of the update directly controls the RMS output change the layer induces. If we want “steepest descent per unit output RMS change,” we must optimize in a spectral-norm geometry.

## Steepest descent in a spectral-norm ball

For a step $$O \in \mathbb{R}^{m\times n}$$ under a small learning rate $$\eta$$, first-order loss decrease is approximately $$\langle G_t, O \rangle$$. The “best” decrease per bounded output change is:
$$
\min_{ \|O\|_2 \le 1 } \; \langle G_t, O \rangle.
$$
Let the SVD be $$G_t = U \Sigma V^\top$$ with singular values $$\sigma_1\ge \cdots \ge 0$$. Von Neumann’s trace inequality implies
$$
\min_{\|O\|_2 \le 1} \langle G_t, O \rangle \;=\; -\|G_t\|_*,
\quad\text{achieved at}\quad
O^\star = -\,U V^\top.
$$
If we write the update as $$W_{t} \leftarrow W_{t-1} - \eta\,O_t$$, then using $$O_t = U V^\top$$ yields the steepest descent direction when the minus sign is placed in the update rule.

Equivalently via convex duality: since $$\|\cdot\|_2$$ and $$\|\cdot\|_*$$ are dual,
$$
\|G_t\|_* \;=\; \max_{\|O\|_2 \le 1} \langle G_t, O \rangle,
$$
and the maximizer is $$O = U V^\top$$. Minimizing $$\langle G_t, O \rangle$$ simply flips the sign in the update.

Conclusion: the spectrally constrained steepest-descent direction is the matrix “sign” of $$G_t$$ (up to sign convention), namely $$U V^\top$$.

## Polar decomposition and the matrix sign

For any full-rank $$X \in \mathbb{R}^{m\times n}$$, the polar decomposition writes
$$
X \;=\; Q H, \quad Q \in \mathbb{R}^{m\times n},\; Q^\top Q = I_n,\quad H = (X^\top X)^{1/2}\succeq 0.
$$
Then the “semi-orthogonal” factor is
$$
Q \;=\; X\,(X^\top X)^{-1/2}.
$$
If $$X = U \Sigma V^\top$$, then $$Q = U V^\top$$. Hence computing $$Q$$ is equivalent to applying the matrix sign to $$X$$ in the rectangular (semi-orthogonal) sense.

Muon constructs $$O_t \approx \operatorname{sign}(M_t) := M_t (M_t^\top M_t)^{-1/2}$$ efficiently, avoiding explicit SVD.

## Momentum and Muon’s base step

Muon uses momentum on the matrix gradient:
$$
M_t \;=\; \beta\,M_{t-1} + G_t,
$$
with $$\beta \in [0,1)$$ (e.g., $$0.95$$). The Muon direction is the semi-orthogonal factor of $$M_t$$:
$$
O_t \;\approx\; \operatorname{sign}(M_t) \;=\; M_t (M_t^\top M_t)^{-1/2}.
$$
The raw Muon step (ignoring decay and scaling for the moment) is
$$
W_t \;=\; W_{t-1} - \eta_t\,O_t.
$$

## Computing the inverse square root without SVD

We need $$(M_t^\top M_t)^{-1/2}$$. A classical approach is Newton–Schulz iteration for the matrix inverse square root.

### Deriving Newton–Schulz for $$A^{-1/2}$$

Let $$A \succ 0$$ and seek $$Y \approx A^{-1/2}$$. Consider solving $$F(Y) = Y^{-2} - A = 0$$ by Newton’s method in the Banach algebra of matrices:
$$
Y_{k+1} \;=\; Y_k - \tfrac{1}{2}\,Y_k\,(I - A Y_k^2).
$$
Algebra gives the well-known coupled iteration (Higham’s formulation). Define
$$
Z_k \;=\; A\,Y_k^2.
$$
Then one form of the iteration that keeps symmetry and stability is
$$
\begin{aligned}
Y_{k+1} &= \tfrac{1}{2}\,Y_k\,(3I - Z_k),\\
Z_{k+1} &= \tfrac{1}{2}\,Z_k\,(3I - Z_k),
\end{aligned}
$$
initialized with a scaled $$Y_0$$ so that $$\|I - Z_0\| < 1$$ (e.g., scale $$A$$ to have spectrum in $$(0,1]$$). Under this condition, $$Z_k \to I$$ quadratically and $$Y_k \to A^{-1/2}$$.

### Specialization to the matrix sign

For the rectangular “sign” $$Q = X (X^\top X)^{-1/2}$$, we need $$A = X^\top X$$. With the coupled Newton–Schulz above and a few iterations (e.g., 3–6), we obtain a highly accurate $$Q$$ using only matrix multiplications, no SVD.

## One-sequence polynomial view on singular values

If $$X = U \Sigma V^\top$$, then any update of the form $$U\,\varphi(\Sigma)\,V^\top$$ acts independently on singular values. Newton–Schulz can be seen as repeatedly applying a low-degree polynomial that pushes each $$\sigma_i$$ toward $$1$$. For the classical sign/orthogonalization,
$$
\phi(s) \;=\; \tfrac{3}{2} s \;-\; \tfrac{1}{2} s^3,
$$
and composing $$\phi$$ a few times rapidly maps $$s>0$$ to $$1$$. In practice, Muon uses a pre-normalization of $$X$$ (e.g., by $$\|X\|_F$$ or a power-of-two estimate of $$\|X\|_2$$) so that the singular values start in a contraction region where polynomial iteration is stable in low precision.

## Full Muon update with scaling and decay

Two practical refinements stabilize training and match scales across layers:

1) Step scaling. The semi-orthogonal $$O_t$$ has unit singular values and $$\|O_t\|_F = \sqrt{\operatorname{rank}(O_t)} \le \sqrt{\min(m,n)}$$. Per-parameter RMS of $$O_t$$ is $$ \|O_t\|_F / \sqrt{mn} \approx 1/\sqrt{\max(m,n)} $$. To achieve a comparable RMS update across widths, use a scale proportional to $$\sqrt{n}$$ (column dimension):
$$
\widetilde{O}_t \;=\; c_n\,O_t,\quad c_n \;=\; \alpha\,\sqrt{n},
$$
with $$\alpha$$ a small constant (e.g., $$0.2$$). This makes the per-parameter RMS step roughly width-invariant and compatible with schedules calibrated for scalar-wise optimizers.

2) Weight decay (decoupled or coupled). A simple coupled form is:
$$
W_t \;=\; W_{t-1} - \eta_t\left( \widetilde{O}_t + \lambda\,W_{t-1} \right).
$$

Putting it together:
$$
\boxed{
\begin{aligned}
M_t &= \beta\,M_{t-1} + G_t,\\
O_t &\approx \operatorname{sign}(M_t) \;=\; M_t (M_t^\top M_t)^{-1/2},\\
W_t &= W_{t-1} - \eta_t\left(\alpha\sqrt{n}\,O_t + \lambda\,W_{t-1}\right).
\end{aligned}
}
$$

## Why orthogonalization fixes “collapsed” momentum

Empirically, momentum accumulators in high-dimensional layers tend to be dominated by a few singular directions (near low-rank). If we naively step in $$M_t$$, learning concentrates in those dominant modes. Replacing $$M_t$$ by $$O_t = \operatorname{sign}(M_t) = U V^\top$$ spreads energy uniformly across the singular directions of $$M_t$$: each singular direction gets magnitude $$1$$. This “debiases” the step toward under-represented directions, improving conditioning and data efficiency.

Formally, write $$M_t = U \Sigma V^\top$$. Then
$$
\langle G_t, O_t\rangle \;=\; \langle U \Sigma V^\top, U V^\top\rangle \;=\; \operatorname{tr}(\Sigma),
$$
maximizing (or minimizing, with sign) the loss decrease per unit spectral-norm step. This is the exact steepest-descent direction in the spectral-norm geometry.

## Stability of spectral norm under decay

Consider coupled decay with $$O_t$$ semi-orthogonal and let $$\eta_t = \eta$$ for simplicity. Submultiplicativity and the triangle inequality yield
$$
\|W_t\|_2 \;=\; \| (1-\eta\lambda)\,W_{t-1} - \eta\,\alpha\sqrt{n}\,O_t \|_2
\;\le\; (1-\eta\lambda)\,\|W_{t-1}\|_2 + \eta\,\alpha\sqrt{n}\,\|O_t\|_2.
$$
Since $$\|O_t\|_2 = 1$$, we obtain the recursion
$$
\|W_t\|_2 \;\le\; (1-\eta\lambda)\,\|W_{t-1}\|_2 + \eta\,\alpha\sqrt{n}.
$$
Solving this affine recursion (assuming constant $$\eta,\lambda$$) gives a steady-state bound
$$
\limsup_{t\to\infty} \|W_t\|_2 \;\le\; \frac{\alpha\sqrt{n}}{\lambda}.
$$
Thus decay plus a bounded-norm update $$O_t$$ regulates the layer Lipschitz constant in a simple, interpretable way.

## Learning-rate transfer across width

Because $$O_t$$ has unit singular values and we scale by $$\sqrt{n}$$, the per-parameter RMS step of $$\alpha\sqrt{n}\,O_t$$ is roughly constant across widths. This supports learning-rate schedules that transfer between narrow and wide models. A short calculation: with $$O_t$$ semi-orthogonal, $$\|O_t\|_F^2 = \operatorname{rank}(O_t) \approx n$$ (for $$m\ge n$$), so
$$
\text{RMS}(O_t) \;\approx\; \frac{\sqrt{n}}{\sqrt{mn}} \;=\; \frac{1}{\sqrt{m}}.
$$
Multiplying by $$\sqrt{n}$$ gives $$\sqrt{n}/\sqrt{m}$$. In common transformer settings with fixed aspect ratios, this is approximately width-invariant, so tuning $$\alpha$$ and $$\eta$$ once can generalize across model sizes.

## Implementation details and numerics

- Parameter grouping: apply Muon only to true 2D hidden matrices; use a standard optimizer (e.g., AdamW) for embeddings, biases, layer norms, and output heads.
- Momentum: $$\beta \approx 0.95$$. Nesterov momentum is compatible; replace $$G_t$$ by the Nesterov lookahead gradient if desired.
- Newton–Schulz iterations: 3–6 steps typically suffice. Pre-scale $$M_t$$ to keep singular values in a contraction region, e.g., divide by an estimate of $$\|M_t\|_2$$ (power iteration or a fast proxy) or use a Frobenius-norm scaling and compensate.
- Polynomial view: apply the cubic $$\phi(s) = \tfrac{3}{2}s - \tfrac{1}{2}s^3$$ repeatedly, or use higher-order stabilized polynomials obtained by composing $$\phi$$ and re-centering. All act only via GEMMs.

### Pseudocode (conceptual)

```python
# W: weight matrix (m x n), m >= n typical
# G: gradient dL/dW at step t
# M: momentum buffer, same shape as W

beta = 0.95
alpha = 0.2    # scale coefficient
lam = 0.01     # weight decay (example)
eta = schedule(t)

# 1) Momentum
M = beta * M + G

# 2) Pre-scale for stability
s = frobenius_norm(M) + 1e-12
X = M / s

# 3) Newton–Schulz orthogonalization (k steps)
def orthogonalize(X, k=5):
    # one-sequence cubic iteration equivalent on rectangular X
    for _ in range(k):
        XT_X = X.T @ X          # (n x n)
        X = 1.5 * X - 0.5 * X @ XT_X
    return X

O = orthogonalize(X, k=5)       # approx semi-orthogonal factor of M/s

# Undo pre-scaling and apply global step scaling alpha*sqrt(n)
n = X.shape[1]
O = O                           # O already semi-orthogonal; scaling is global
step_dir = alpha * (n**0.5) * O

# 4) Coupled decay update
W = W - eta * (step_dir + lam * W)
```

Remarks:
- In practice, pre-scaling and the iteration variant are chosen to maximize low-precision stability (bf16/fp16) and minimize GEMMs.
- If using the coupled form above, decay acts in the same GEMM stream; decoupled decay is also possible.

## Connections to other optimizers

- Spectral-norm steepest descent versus per-coordinate adaptivity: Muon offers a light-weight non-diagonal structure without maintaining second-moment statistics or expensive per-layer factorizations.
- Relation to Shampoo and K-FAC: those methods approximate curvature with Kronecker or factored matrices; Muon instead normalizes at the level of singular directions via the polar factor.
- Relation to μP: Muon’s $$\sqrt{n}$$ scaling and spectral geometry naturally encourage width-transferable learning rates, echoing principles of maximal-update parameterization.

## Worked mini-example (by hand)

Let
$$
M = \begin{bmatrix} 3 & 0 \\ 0 & 1 \end{bmatrix}.
$$
SVD is $$U = I$$, $$\Sigma = \operatorname{diag}(3,1)$$, $$V = I$$. The exact Muon direction is $$O = U V^\top = I$$.

Start Newton–Schulz on $$X_0 = M / \|M\|_F = \operatorname{diag}(3,1) / \sqrt{3^2+1^2} = \operatorname{diag}(3,1)/\sqrt{10}$$.
Apply one cubic step $$X_1 = \tfrac{3}{2}X_0 - \tfrac{1}{2}X_0^3$$ entrywise on singular values:
$$
\phi(s) = \tfrac{3}{2}s - \tfrac{1}{2}s^3.
$$
For $$s_1 = 3/\sqrt{10} \approx 0.9487$$, $$\phi(s_1) \approx 0.9997$$.
For $$s_2 = 1/\sqrt{10} \approx 0.3162$$, $$\phi(s_2) \approx 0.4687$$.
Another step drives both closer to $$1$$. After a few steps, singular values $$\to 1$$ and $$X_k \to U V^\top = I$$, yielding $$O \approx I$$ as expected.

## Summary of the final Muon rule

- Compute momentum $$M_t = \beta M_{t-1} + G_t$$.
- Compute $$O_t \approx \operatorname{sign}(M_t) = M_t (M_t^\top M_t)^{-1/2}$$ by Newton–Schulz (no SVD).
- Update
$$
W_t \;=\; W_{t-1} - \eta_t\big( \alpha\sqrt{n}\,O_t + \lambda\,W_{t-1} \big).
$$
- Apply only to 2D hidden matrices; use a standard optimizer for embeddings, biases, norms, and heads.

## Practical defaults

- Momentum $$\beta \approx 0.95$$.
- Newton–Schulz steps: 3–6 (often 5).
- Scale $$\alpha\sqrt{n}$$ with $$\alpha \approx 0.2$$.
- Modest $$\lambda$$ (decay) to regulate $$\|W\|_2$$.
- Warmup + cosine or similar schedule; same schedule can usually serve both Muon groups and non-Muon groups.
