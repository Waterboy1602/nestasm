export interface Config {
  cde_config: {
    quadtree_depth: number;
    hpg_n_cells: number;
    item_surrogate_config: {
      pole_coverage_goal: number;
      max_poles: number;
      n_ff_poles: number;
      n_ff_piers: number;
    };
  };
  poly_simpl_tolerance: number;
  prng_seed: number;
  n_samples: number;
  ls_frac: number;
}

export interface Input {
  name: string;
  items: Item[];
  strip_height: number;
}

export interface Item {
  id: number;
  demand: number;
  allowed_orientations: number[];
  shape: Shape;
}

export interface Shape {
  type: string;
  data: number[][];
}
