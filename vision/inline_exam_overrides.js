/* Vision Chapter 1: CIFAR-10 train augmentation을 한 묶음으로 점검 */
window.INLINE_EXAM_OVERRIDES = {
  "01_ResNet18_CIFAR10.ipynb": {
    replacements: [
      {cell: 6, id: "vision-random-flip", from: "T.RandomHorizontalFlip()"},
      {cell: 6, id: "vision-to-tensor", from: "T.ToTensor()"},
    ],
    blanks: [
      {
        id: "vision-random-flip",
        label: "학습 이미지 좌우 반전 증강",
        instruction: "Random Crop 뒤에 학습 이미지의 좌우 반전 증강을 적용하세요.",
        answer: "T.RandomHorizontalFlip()",
      },
      {
        id: "vision-to-tensor",
        label: "PIL 이미지를 CHW Tensor로 변환",
        instruction: "증강된 PIL 이미지를 [C, H, W] 범위 0~1 Tensor로 변환하세요.",
        answer: "T.ToTensor()",
      },
    ],
  },
};
