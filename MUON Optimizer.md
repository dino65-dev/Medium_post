---
layout: default
title: Muon Optimizer
permalink: /muon-optimizer/
---
# Muon Optimizer — Complete Mathematical Derivation (LaTeX, Low-Level Up)

This writeup walks step-by-step from basic matrix calculus to Muon’s core update, deriving everything with no skipped steps. No Adam/optimizer background needed.

---

## 1. **Background: Weight Matrix Update in Deep Nets**

Let \( W \in \mathbb{R}^{m \times n} \) be the weight matrix of a hidden layer.  
Given a mini-batch and loss \( L \), the standard gradient step is:

\[
W_{t+1} = W_t - \eta \nabla_W L(W_t)
\]

But, for large matrices, the *structure* of \( \nabla_W L \) (call it \( G_t \)) matters—we want to use the matrix’s geometry.

---

## 2. **Momentum for Matrices**

Add momentum—capture history of gradients:

\[
M_t = \beta M_{t-1} + (1-\beta) G_t
\]

For Muon (and most practice):  
\( \beta \) is close to 1 (e.g., 0.95) and people often use \( M_t = \beta M_{t-1} + G_t \).

- \( M_t \in \mathbb{R}^{m \times n} \): accumulates “direction.”

---

## 3. **The Classic Update and Its Problem**

Naive SGD (or AdamW) treats every entry of \( M_t \) “diagonally”—each gets its own step.  
But \( M_t \) might be “low rank” (mostly varying in a few directions).

*Idea*: Rather than step “diagonally,” step in a way that uses all possible matrix directions equally.

---

## 4. **Muon’s Core: Orthogonalization via Spectral Norm Constraint**

### **Optimization Subproblem**

At every step, find the direction closest to \( M_t \),  
but force it to be “spectrally bounded”—i.e., its largest singular value is ≤ 1.

\[
O_t = \underset{O \in \mathbb{R}^{m \times n} : \|O\|_2 \leq 1}{\mathrm{argmin}} \|M_t - O\|_F^2
\]

where:

- \( \|O\|_2 = \) spectral norm (largest singular value).
- \( \|\,\cdot\,\|_F = \) Frobenius norm (sum of squares of all entries).

### **Closed-Form Solution Using SVD**

Let \( M_t = U \Sigma V^\top \) (Singular Value Decomposition),  
where \( U, V \) are orthogonal (\( U^\top U = I \), \( V^\top V = I \)), \( \Sigma = \mathrm{diag}(\sigma_1, \ldots, \sigma_r) \).

- The closest matrix in spectral norm \(\leq 1\) is:
  - Replace every singular value \( \sigma_i \) with \( \min(\sigma_i, 1) \).

If you want *orthogonality* (\( \sigma_i \rightarrow 1 \)),  
the best rank-preserving projection is \( O_t = U V^\top \).

**Proof**  
Solve:

\[
\min_{O \in \mathbb{R}^{m \times n}: \|O\|_2 \leq 1} \|M_t - O\|_F^2
\]

SVD: \( M_t = U \Sigma V^\top \).  
Want to pick \( O = U \tilde{\Sigma} V^\top \), with \( |\tilde{\sigma}_i| \leq 1 \).

- For \(\|\,\cdot\,\|_F^2\), the closest is to set \(\tilde{\sigma}_i = \min(\sigma_i, 1)\)  
- If all \(\sigma_i > 1\), projection is “hard” to boundary, i.e. all \(\tilde{\sigma}_i = 1\).

For Muon, the *orthogonalizer* is simply:

\[
O_t = U V^\top
\]

This is the “sign” of the matrix.

---

## 5. **Newton–Schulz Iteration: Fast Orthogonalization**

Direct SVD is slow (costly on GPU), so Muon uses **Newton–Schulz** (NS) iteration to approximate \( U V^\top \) efficiently.

### **Derivation**

Given \( A \in \mathbb{R}^{m \times n} \), consider computing its matrix sign:

\[
\mathrm{sign}(A) = A (A^\top A)^{-1/2}
\]

But inverting the square root matrix is expensive.

#### **NS Iteration (for square, full-rank \(X\))**

Let \( X_0 = A / \|A\| \), and iterate:

\[
X_{k+1} = \frac{3}{2} X_k - \frac{1}{2} X_k X_k^\top X_k
\]

Each step pushes singular values closer to 1.

##### **Proof of contraction:**  
Let the SVD of \( X \) be \( X = U \Sigma V^\top \),  
NS step acts as

\[
X \to U f(\Sigma) V^\top, \quad f(\sigma) = \frac{3}{2}\sigma - \frac{1}{2}\sigma^3
\]

So,  \( f(\sigma) \) shrinks large singular values and boosts small ones toward 1.

##### **Generalized Polynomial Map**

Muon improves stability with a quintic polynomial:

\[
\varphi(x) = a x + b x^3 + c x^5
\]

- Coefficients \( (a, b, c) \) chosen so that \( \varphi(1) = 1, \varphi'(1) = 0 \) (ensures tangent at the fixed point), \( \varphi(0) = 0 \).

Typically:  
\(
a \approx 3.4445, \quad b \approx -4.7750, \quad c \approx 2.0315
\)

Iterate NS (“compose” the polynomial function with the matrix) 5 times,  
normalizing initial \( X \) by its Frobenius norm.

---

## 6. **Scaling: Muon’s “0.2√n” Factor**

Actual update step includes a normalization:

\[
W_{t+1} = W_t - \eta \left( c \, O_t + \lambda W_t \right)
\]
where
- \( c = 0.2 \sqrt{n} \), \( n \) = number of columns of \( W \)

#### **Why?**
To **match the RMS (root-mean-square) step size** of AdamW, so you can use the same learning rate without re-tuning.

**Heuristic:**  
- For a standard random matrix \( A \in \mathbb{R}^{m \times n} \), the Frobenius norm satisfies  
  \( \|A\|_F \sim \sqrt{mn} \)  
- For an orthogonal matrix \( O \), each singular value = 1, so  
  \( \|O\|_F = \sqrt{\min(m, n)} \times 1 \)  
- Scaling by \( 0.2\sqrt{n} \) ensures the update matches RMS step size of AdamW or SGD.

---

## 7. **Full Muon Update Rule**

Bringing all this together, **for every 2D hidden weight matrix:**

- Compute momentum:

  \[
  M_t = \beta M_{t-1} + G_t
  \]

- Orthogonalize with NS (5 steps, bfloat16, scaled):

  \[
  O_t \approx \mathrm{NS}(M_t)
  \]

- Apply step:

  \[
  W_{t+1} = W_t - \eta \big( 0.2\sqrt{n} \, O_t + \lambda W_t \big)
  \]

- For all other parameters (vectors: bias, norm, embeddings, heads),  
  use AdamW as usual.

---

## 8. **Visual Intuition with Equations**

**Standard AdamW/SGD:**  
Only consider  
\[
W_{t+1} = W_t - \eta\, \text{(diagonal step)}
\]

**Muon:**  
Considers the *matrix as a whole*,  
finding the best step in *spectral-norm constrained* direction:

\[
W_{t+1} = W_t - \eta\, \text{(best orthogonal direction step)}
\]

This avoids stretching only along dominant singular vectors (large directions),  
helping gradients be better “spread out.”

---

## 9. **Algorithm: Pseudocode**

Given:
- \( W \): layer weight matrix (\( m \times n \))
- \( G_t \): current gradient (\( m \times n \)), at step \( t \)
- \( \beta \): momentum (0.95)
- \( \eta \): learning rate
- \( \lambda \): weight decay

### **Pseudocode**

1. **Momentum accumulation:**
   \[
   M_t = \beta M_{t-1} + G_t
   \]
2. **Normalize:**  
   \( M_t \leftarrow M_t / \|M_t\|_F \)
3. **5 Newton–Schulz iterations:**  
   For \( k = 1,\ldots,5 \):
   \[
   M_t \leftarrow a\,M_t + b\,(M_t M_t^\top M_t) + c\,(M_t M_t^\top M_t M_t^\top M_t)
   \]  
   (with polynomial coefficients \(a, b, c\))
4. **Scale:**  
   \( M_t \leftarrow 0.2 \sqrt{n}\, M_t \)
5. **Update weight:**  
   \[
   W_{t+1} = W_t - \eta \left( M_t + \lambda W_t \right)
   \]
---

## 10. **In Practice**

**What you need to implement:**
- Code performing NS-iteration on \( M_t \)
- Momentum update for all 2D weights
- Grouping: use Muon **only** for 2D hidden weights; AdamW for everything else
- No special scheduling needed—just match learning rates/decay as for AdamW

---

## 11. **Summary of Derived Math**

- Muon solves:  
  \[
  \max_{O : \|O\|_2 \leq 1} \, \mathrm{tr}(G^\top O)
  \]
- SVD-based solution:  
  \( G = U \Sigma V^\top \implies O^* = U V^\top \)
- Newton–Schulz provides a fast approximation to the above.
- Scaling by \( 0.2\sqrt{n} \) makes the RMS update “look like” AdamW for hyperparameter compatibility.
- Only applied to hidden 2D weights; rest use AdamW.

---

**References**  
- [Muon: An Optimizer for Hidden Layers in Neural Networks](https://kellerjordan.github.io/posts/muon/)
- [Practical Efficiency of Muon for Pretraining (arXiv:2505.02222)](https://arxiv.org/pdf/2505.02222.pdf)

For questions, clarifications, or code examples, open an Issue!
